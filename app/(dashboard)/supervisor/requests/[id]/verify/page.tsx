import { getRequestById } from '@/lib/queries/request.queries';
import { getAccomplishmentByRequest } from '@/lib/queries/lookup.queries';
import { notFound } from 'next/navigation';
import { VerifyAccomplishmentForm } from '@/components/assignments/verify-accomplishment-form';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function VerifyPage({ params }: Props) {
  const { id } = await params;
  const [{ data: request }, { data: acc }] = await Promise.all([
    getRequestById(id),
    getAccomplishmentByRequest(id),
  ]);
  if (!request) notFound();

  if (!acc) {
    return (
      <div className="max-w-xl">
        <h1 className="text-xl font-bold text-slate-800 mb-4">
          Verify Work – {request.ticket_number}
        </h1>
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 text-sm text-amber-800">
          The assigned technician has not yet recorded work details. Verification cannot proceed until start and end times have been logged.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <nav className="text-sm text-slate-400">
        <Link href="/supervisor" className="hover:text-teal-600">
          Requests
        </Link>
        <span className="mx-2">›</span>
        <span className="text-slate-600">Verify</span>
      </nav>

      <h1 className="text-xl font-bold text-slate-800">
        Verify Work – {request.ticket_number}
      </h1>

      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm space-y-2 shadow-sm">
        <p>
          <span className="font-medium text-slate-500">Technician:</span>{' '}
          {acc.conductor?.full_name ?? '—'}
        </p>
        <p>
          <span className="font-medium text-slate-500">Started:</span>{' '}
          {acc.started_at
            ? new Date(acc.started_at).toLocaleString('en-PH')
            : '—'}
        </p>
        <p>
          <span className="font-medium text-slate-500">Finished:</span>{' '}
          {acc.finished_at ? (
            new Date(acc.finished_at).toLocaleString('en-PH')
          ) : (
            <span className="text-red-500">Not yet recorded</span>
          )}
        </p>
        {acc.notes && (
          <div className="pt-2 border-t border-slate-100">
            <p className="font-medium text-slate-500 mb-1">Notes</p>
            <p className="text-slate-700">{acc.notes}</p>
          </div>
        )}
      </div>

      <VerifyAccomplishmentForm
        accomplishmentId={acc.id}
        requestId={id}
        finishedAt={acc.finished_at}
      />
    </div>
  );
}