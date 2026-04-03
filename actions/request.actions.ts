// actions/request.actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requestSchema } from "@/lib/validations/request.schema";
import { ppsrServiceDataSchema } from "@/lib/validations/ppsr-service-data.schema";
import {
  actionFormError,
  actionError,
  type ActionResult,
} from "@/lib/utils/errors";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { InsertRequest } from "@/types/models";
import type { Json } from "@/types/database.types";
import { isRequesterRole } from "@/lib/rbac";

export async function requestService(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> { 
  const supabase = await createClient();
  const admin = createAdminClient();

  // Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return actionError("form", "You must be signed in to submit a request.");

  // Verify requester is approved and has the correct role
  const { data: requester } = await admin
    .from("users")
    .select("id, role, signup_status")
    .eq("auth_id", user.id)
    .single();
  if (!requester || requester.signup_status !== "approved")
    return actionError(
      "form",
      "Your account is not yet approved to submit requests.",
    );
  if (!isRequesterRole(requester.role))
    return actionError("form", "Only students and staff may submit requests.");

  // Parse and validate base form fields
  const raw = Object.fromEntries(formData.entries());
    const result = requestSchema.safeParse(raw);
  if (!result.success)
    return { success: false, errors: result.error.flatten().fieldErrors };

  // PPSR: validate the service_data object assembled from individual fields
  let validatedServiceData: Record<string, unknown> | null = null;
  if (result.data.request_type === "ppsr") {
    // Build service_data object from formData entries (prefixed 'sd_')
    const rawServiceData: Record<string, unknown> = {
      service_type: result.data.service_type,
    };
    for (const [key, val] of formData.entries()) {
      if (key.startsWith("sd_")) {
        const field = key.slice(3);
        // Coerce booleans and numbers from string
        if (val === "true") rawServiceData[field] = true;
        else if (val === "false") rawServiceData[field] = false;
        else if (!isNaN(Number(val)) && val !== "")
          rawServiceData[field] = Number(val);
        else rawServiceData[field] = val;
      }
    }
    const sdResult = ppsrServiceDataSchema.safeParse(rawServiceData);
    if (!sdResult.success) {
      return { success: false, errors: sdResult.error.flatten().fieldErrors };
    }
    const { service_type: _, ...dataOnly } = sdResult.data;
    validatedServiceData = dataOnly;
  }

  // Resolve pending status ID
  const { data: pendingStatus } = await admin
    .from("statuses")
    .select("id")
    .eq("status_name", "pending")
    .single();
  if (!pendingStatus)
    return actionError(
      "form",
      "System error: pending status not found. Contact admin.",
    );

  // Build request payload
  const payload: InsertRequest = {
    requester_id: requester.id,
    title: result.data.title,
    description: result.data.description ?? "",
    location_id: result.data.location_id,
    priority_id: result.data.priority_id,
    status_id: pendingStatus.id,
    request_type: result.data.request_type,
    // Explicitly set nullable fields to null (optional, but good practice)
    assigned_technician_id: null,
    estimated_completion_date: null,
    actual_completion_date: null,
  };

  // Add category_id only for RMR (PPSR leaves it null)
  if (result.data.request_type === "rmr") {
    payload.category_id = result.data.category_id;
  } else {
    payload.category_id = null; // Explicit null for PPSR
  }

  // Insert request – generate_ticket_number trigger fires on INSERT
  const { data: newRequest, error: reqError } = await admin
    .from("requests")
    .insert(payload)
    .select("id, ticket_number")
    .single();
  if (reqError || !newRequest) return actionFormError(reqError);

  // If PPSR: insert ppsr_details (check ppsr request_type trigger validates)
  if (result.data.request_type === "ppsr" && validatedServiceData) {
    const { error: ppsError } = await admin.from("ppsr_details").insert({
      request_id: newRequest.id,
      service_type: result.data.service_type,
      service_data: validatedServiceData as Json,
    });
    if (ppsError) return actionFormError(ppsError);
  }

  // Revalidate and redirect
  revalidatePath("/requester/requests");
  redirect(`/requester/requests/${newRequest.id}?submitted=true`);
}

export const createRequest = requestService;

export async function cancelRequest(requestId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("form", "Unauthorized.");

  const { data: requester } = await admin
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();
  if (!requester) return actionError("form", "User record not found.");

  const { data: cancelledStatus } = await admin
    .from("statuses")
    .select("id")
    .eq("status_name", "cancelled")
    .single();
  const { data: pendingStatus } = await admin
    .from("statuses")
    .select("id")
    .eq("status_name", "pending")
    .single();
  if (!cancelledStatus || !pendingStatus)
    return actionError("form", "System error: status not found.");

  const { error } = await admin
    .from("requests")
    .update({ status_id: cancelledStatus.id })
    .eq("id", requestId)
    .eq("requester_id", requester.id) // own requests only
    .eq("status_id", pendingStatus.id); // only cancellable from pending
  if (error) return actionFormError(error);

  revalidatePath("/requester/requests");
  return { success: true };
}


// Allows requester to update description when status = under_review
export async function updateRequestDescription(
  requestId: string,
  description: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return actionError("form", "Unauthorized.");

  const { data: requester } = await admin
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();
  if (!requester) return actionError("form", "User record not found.");

  const { data: underReviewStatus } = await admin
    .from("statuses")
    .select("id")
    .eq("status_name", "under_review")
    .single();
  if (!underReviewStatus) return actionError("form", "System error.");

  if (!description || description.trim().length < 10)
    return actionError(
      "description",
      "Description must be at least 10 characters.",
    );

  const { error } = await admin
    .from("requests")
    .update({ description: description.trim() })
    .eq("id", requestId)
    .eq("requester_id", requester.id)
    .eq("status_id", underReviewStatus.id); // only editable when under_review
  if (error) return actionFormError(error);

  revalidatePath(`/requester/requests/${requestId}`);
  return { success: true };
}
