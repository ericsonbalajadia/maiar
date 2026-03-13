// components/assignments/assign-technician-form.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { assignTechnician } from '@/actions/assignment.actions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ActionResult } from '@/lib/utils/errors';

const INITIAL_STATE: ActionResult = { success: false, errors: {} };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Assigning...' : 'Assign Technician'}
    </button>
  );
}

interface Technician {
  id: string;
  full_name: string;
  email: string;
}

interface AssignTechnicianFormProps {
  requestId: string;
  technicians: Technician[];
}

export function AssignTechnicianForm({ requestId, technicians }: AssignTechnicianFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(assignTechnician, INITIAL_STATE);

  // Redirect to supervisor dashboard on success
  useEffect(() => {
    if (state.success) {
      router.push('/supervisor');
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="request_id" value={requestId} />

      {/* Technician select */}
      <div>
        <label htmlFor="assigned_user_id" className="block text-sm font-medium text-slate-700">
          Select Technician
        </label>
        <select
          id="assigned_user_id"
          name="assigned_user_id"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          <option value="">Choose a technician</option>
          {technicians.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.full_name} ({tech.email})
            </option>
          ))}
        </select>
        {!state.success && state.errors?.assigned_user_id && (
          <p className="mt-1 text-xs text-red-600">{state.errors.assigned_user_id[0]}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Assignment Notes <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm resize-none focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      {/* Global form error */}
      {!state.success && state.errors?.form && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-xs text-red-700">{state.errors.form[0]}</p>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}