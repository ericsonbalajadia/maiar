// app/(dashboard)/requester/requests/[id]/feedback/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import Link from 'next/link'

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
    // Check why – but show friendly message only
    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center space-y-4">
                <div className="text-amber-800">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-semibold mb-1">Cannot Submit Feedback</h2>
                    <p className="text-sm">Feedback has already been submitted for this request, or the 30‑day feedback window has closed.</p>
                </div>
                <Link href={`/requester/requests/${id}`}>
                    <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                        Return to Request
                    </button>
                </Link>
            </div>
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