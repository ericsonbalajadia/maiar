//app/(dashboard)/supervisor/requests/[id]/assign/page.tsx
import { getRequestById } from '@/lib/queries/request.queries';
import { getAvailableTechnicians } from '@/lib/queries/technician.queries'; // changed import
import { notFound } from 'next/navigation';
import { AssignTechnicianForm } from '@/components/assignments/assign-technician-form';
import { StatusBadge } from '@/components/common/status-badge';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SupervisorAssignPage({ params }: Props) {
  const { id } = await params;
  const [{ data: request }, technicians] = await Promise.all([
    getRequestById(id),
    getAvailableTechnicians(), // now returns AvailableTechnician[]
  ]);
  if (!request) notFound();

  const currentStatus = request.statuses?.status_name ?? 'pending';
  const currentAssignment = request.request_assignments?.find(a => !a.completed_at);
  const currentTechnicianId = currentAssignment?.technician?.id ?? null;

  return (
    <div className="max-w-2xl space-y-6">
      <nav className="text-sm text-slate-400">
        <Link href="/supervisor" className="hover:text-teal-600">
          Requests
        </Link>
        <span className="mx-2">›</span>
        <span className="text-slate-600">Assign</span>
      </nav>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-slate-400">{request.ticket_number}</p>
          <h1 className="mt-1 text-xl font-bold text-slate-800">{request.title}</h1>
        </div>
        <StatusBadge status={currentStatus} />
      </div>

      <AssignTechnicianForm
        requestId={id}
        technicians={technicians}
        currentAssignedId={currentTechnicianId}
        ticketNumber={request.ticket_number}
      />
    </div>
  );
}