// app/(dashboard)/technician/requests/[id]/work/page.tsx
import { getRequestById, getCurrentAssignment } from '@/lib/queries/request.queries';
import { getAccomplishmentByRequest } from '@/lib/queries/lookup.queries';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AcceptanceForm } from '@/components/assignments/acceptance-form';
import { AccomplishmentForm } from '@/components/assignments/accomplishment-form';
import { StatusBadge } from '@/components/requests/statusBadge';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TechnicianWorkPage({ params }: Props) {
  const { id } = await params;

  // Get current technician ID
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null; // middleware should handle

  const { data: technician } = await admin
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (!technician) return null;

  const [{ data: request }, { data: acc }, { data: assignment }] = await Promise.all([
    getRequestById(id),
    getAccomplishmentByRequest(id),
    getCurrentAssignment(id, technician.id),
  ]);
  if (!request) notFound();

  const currentStatus = request.statuses?.status_name ?? 'pending';

  const status = request.statuses?.status_name;
  const isAssigned = status === 'assigned';
  const isInProgress = status === 'in_progress';

  return (
    <div className="max-w-2xl space-y-6">
      <nav className="text-sm text-slate-400">
        <Link href="/technician" className="hover:text-teal-600">
          My Tasks
        </Link>
        <span className="mx-2">›</span>
        <span className="text-slate-600">Work</span>
      </nav>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-slate-400">{request.ticket_number}</p>
          <h1 className="mt-1 text-xl font-bold text-slate-800">{request.title}</h1>
        </div>
        <StatusBadge status={currentStatus} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm space-y-2 shadow-sm">
        <p>
          <span className="font-medium text-slate-500">Location:</span>{' '}
          {request.locations?.building_name ?? 'Unknown'}
        </p>
        <div className="pt-2 border-t border-slate-100">
          <p className="font-medium text-slate-500 mb-1">Description</p>
          <p className="text-slate-700 whitespace-pre-wrap">{request.description}</p>
        </div>
      </div>

      {/* Step 1: Accept assignment – only if assigned and assignment exists */}
      {isAssigned && assignment && (
        <AcceptanceForm
          requestId={id}
          assignmentId={assignment.id}
        />
      )}

      {/* Step 2: Log work */}
      {isInProgress && (
        <AccomplishmentForm requestId={id} existingAccomplishment={acc} />
      )}

      {/* Done state */}
      {!isAssigned && !isInProgress && (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-500">
          Status: <strong>{status}</strong> – no further action required.
        </div>
      )}
    </div>
  );
}