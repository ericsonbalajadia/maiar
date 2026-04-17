// app/(dashboard)/requester/requests/[id]/feedback/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { FeedbackForm } from "@/components/feedback/feedback-form";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function RequesterFeedbackPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();
    const admin = createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return <div>Not authenticated</div>;

    // Get internal user id
    const { data: requester } = await admin
        .from("users")
        .select("id")
        .eq("auth_id", user.id)
        .single();
    if (!requester) return <div>User profile not found</div>;

    // Fetch request details (including status and requester_id)
    const { data: request, error } = await admin
        .from("requests")
        .select("id, requester_id, statuses!inner(status_name)")
        .eq("id", id)
        .single();

    if (error || !request) notFound();

    // Check ownership
    if (request.requester_id !== requester.id) return <div>You are not the requester</div>;

    // Only allow feedback if request is completed
    if (request.statuses?.status_name !== "completed") {
        return (
            <div className="p-6">
                <h1 className="text-xl font-bold text-red-600">Request not completed</h1>
                <p>Current status: {request.statuses?.status_name}</p>
                <p>Feedback can only be submitted for completed requests.</p>
            </div>
        );
    }

    // Check the RPC result
    const { data: canSubmit, error: rpcError } = await admin.rpc("can_submit_feedback", {
        p_request_id: id,
        p_user_id: requester.id,
    });

    if (rpcError) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-bold text-red-600">RPC Error</h1>
                <pre className="text-sm">{JSON.stringify(rpcError, null, 2)}</pre>
            </div>
        );
    }

    if (!canSubmit) {
        // Check why: maybe feedback exists or window closed
        const { data: existingFeedback } = await admin
            .from("feedbacks")
            .select("id, submitted_at")
            .eq("request_id", id)
            .maybeSingle();

        const { data: completionDate } = await admin
            .from("requests")
            .select("actual_completion_date")
            .eq("id", id)
            .single();

        return (
            <div className="p-6 space-y-2">
                <h1 className="text-xl font-bold text-amber-600">Cannot submit feedback</h1>
                {existingFeedback ? (
                    <p>✓ Feedback already submitted on {new Date(existingFeedback.submitted_at).toLocaleDateString()}</p>
                ) : (
                    <p>✗ No feedback found, but RPC returned false.</p>
                )}
                <p>Completion date: {completionDate?.actual_completion_date ? new Date(completionDate.actual_completion_date).toLocaleDateString() : "unknown"}</p>
                <p>30-day window expires: {completionDate?.actual_completion_date ? new Date(new Date(completionDate.actual_completion_date).getTime() + 30*24*60*60*1000).toLocaleDateString() : "unknown"}</p>
                <p>Current date: {new Date().toLocaleDateString()}</p>
            </div>
        );
    }

    // If all checks pass, show the form
    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-2">How Did We Do?</h1>
            <p className="text-sm text-gray-500 mb-6">
                Your feedback helps us improve our service.
            </p>
            <FeedbackForm requestId={id} />
        </div>
    );
}