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
import { notifyRequesterByEmail } from '@/lib/notifications/request-email';
// Add missing imports for the form input types (not used directly but kept for clarity)
import type { RmrFormInput, PpsrFormInput } from "@/types/requests.model";
import type { PpsrServiceType } from "@/lib/constants/ppsr-service-types";

// Helper to resolve or create a location from free‑text fields
async function resolveOrCreateLocation(
  buildingName: string,
  floorLevel: string,
  roomNumber: string,
  admin: ReturnType<typeof createAdminClient>
): Promise<string | null> {
  const building = buildingName.trim();
  const floor = floorLevel.trim();
  const room = roomNumber.trim();

  // Look for existing location
  let query = admin
    .from("locations")
    .select("id")
    .ilike("building_name", building);

  if (floor) {
    query = query.ilike("floor_level", floor);
  } else {
    query = query.is("floor_level", null);
  }
  if (room) {
    query = query.ilike("room_number", room);
  } else {
    query = query.is("room_number", null);
  }

  const { data: existing } = await query.maybeSingle();
  if (existing) return existing.id;

  // Create new location
  const { data: inserted, error } = await admin
    .from("locations")
    .insert({
      building_name: building,
      floor_level: floor || null,
      room_number: room || null,
      is_active: true,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("resolveOrCreateLocation error:", error);
    return null;
  }
  return inserted.id;
}

export async function requestService(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const admin = createAdminClient();

  // 1. Authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return actionError("form", "You must be signed in to submit a request.");

  // 2. Requester verification (approved + student/staff)
  const { data: requester } = await admin
    .from("users")
    .select("id, role, signup_status")
    .eq("auth_id", user.id)
    .single();
  if (!requester || requester.signup_status !== "approved")
    return actionError("form", "Your account is not yet approved to submit requests.");
  if (!isRequesterRole(requester.role))
    return actionError("form", "Only students and staff may submit requests.");

  // 3. Parse base form fields
  const raw = Object.fromEntries(formData.entries());
  const result = requestSchema.safeParse(raw);
  console.log('Zod result.data:', JSON.stringify(result.data, null, 2));
  if (!result.success) {
  console.error('Zod validation errors:', result.error.flatten());
  return { success: false, errors: result.error.flatten().fieldErrors };
}

  // 4. PPSR: validate service_data
  let validatedServiceData: Record<string, unknown> | null = null;
  if (result.data.request_type === "ppsr") {
    const rawServiceData: Record<string, unknown> = {
      service_type: result.data.service_type,
    };
    for (const [key, val] of formData.entries()) {
      if (key.startsWith("sd_")) {
        const field = key.slice(3);
        if (val === "true") rawServiceData[field] = true;
        else if (val === "false") rawServiceData[field] = false;
        else if (!isNaN(Number(val)) && val !== "") rawServiceData[field] = Number(val);
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

  // 5. Get pending status ID
  const { data: pendingStatus } = await admin
    .from("statuses")
    .select("id")
    .eq("status_name", "pending")
    .single();
  if (!pendingStatus)
    return actionError("form", "System error: pending status not found. Contact admin.");

  // 6. Resolve location ID from free‑text fields
  const { location_building, location_floor, location_room } = result.data;
  if (!location_building || location_building.trim() === "") {
    return actionError("form", "Building name is required.");
  }
  const locationId = await resolveOrCreateLocation(
    location_building,
    location_floor ?? "",
    location_room ?? "",
    admin
  );
  if (!locationId) {
    return actionError("form", "Failed to resolve or create location.");
  }

  // 7. Build payload (priority_id omitted – DB default will be used)
  const payload: any = {
    requester_id: requester.id,
    title: result.data.title,
    description: result.data.description ?? "",
    location_id: locationId, 
    category_id: null,        // default null, overridden for RMR
    status_id: pendingStatus.id,
    request_type: result.data.request_type,
    assigned_technician_id: null,
    estimated_completion_date: null,
    actual_completion_date: null,
  };

  if (result.data.request_type === "rmr") {
    payload.category_id = result.data.category_id;
  }

  // 8. Insert request (ticket_number generated by trigger)
  const { data: newRequest, error: reqError } = await admin
    .from("requests")
    .insert(payload)
    .select("id, ticket_number")
    .single();
  if (reqError || !newRequest) return actionFormError(reqError);

  // 9. If PPSR, insert ppsr_details
  if (result.data.request_type === "ppsr" && validatedServiceData) {
    const { error: ppsError } = await admin.from("ppsr_details").insert({
      request_id: newRequest.id,
      service_type: result.data.service_type,
      service_data: validatedServiceData as Json,
    });
    if (ppsError) return actionFormError(ppsError);
  }

  try {
    await notifyRequesterByEmail({
      requestId: newRequest.id,
      event: 'request_submitted',
    });
  } catch (error) {
    console.error('requestService: failed to queue submission email', {
      requestId: newRequest.id,
      error,
    });
  }

  // 10. Revalidate and redirect
  revalidatePath("/requester/requests");
  redirect(`/requester/requests/${newRequest.id}?submitted=true`);
}

// Export the service as createRequest – this is what the form will use
export const createRequest = requestService;

// ─── Cancel request (requester only) ─────────────────────────────────────────
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

  const { data: updatedRequest, error } = await admin
    .from("requests")
    .update({ status_id: cancelledStatus.id })
    .select('id')
    .eq("id", requestId)
    .eq("requester_id", requester.id) // own requests only
    .eq("status_id", pendingStatus.id) // only cancellable from pending
    .maybeSingle();
  if (error) return actionFormError(error);

  if (updatedRequest) {
    try {
      await notifyRequesterByEmail({
        requestId,
        event: 'cancelled',
        reason: 'Cancelled by requester.',
      });
    } catch (notifyError) {
      console.error('cancelRequest: failed to queue cancellation email', {
        requestId,
        error: notifyError,
      });
    }
  }

  revalidatePath("/requester/requests");
  return { success: true };
}

// ─── Update request description (needs_info workflow) ────────────────────────
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