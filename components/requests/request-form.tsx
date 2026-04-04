// components/requests/request-form.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import { createRequest } from '@/actions/request.actions';
import { PpsrServiceDataForm } from '@/components/forms/PpsrServiceDataForm';
import { REQUEST_TYPES } from '@/lib/constants/request-types';
import { PPSR_SERVICE_TYPES, PPSR_SERVICE_LABELS } from '@/lib/constants/ppsr-service-types';
import type { DbLocation, DbCategory, DbPriority } from '@/types/models';
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
      {pending ? 'Submitting...' : 'Submit Request'}
    </button>
  );
}

interface NewRequestFormProps {
  locations: DbLocation[];
  categories: DbCategory[];
}

export function NewRequestForm({ locations, categories }: NewRequestFormProps) {
  const [requestType, setRequestType] = useState<'rmr' | 'ppsr'>('rmr');
  const [selectedPpsrType, setSelectedPpsrType] = useState<string>('');
  const [state, formAction] = useFormState(createRequest, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-6">
      {/* Form type toggle */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Request Type
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setRequestType('rmr')}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              requestType === 'rmr'
                ? 'border-teal-500 bg-teal-50 text-teal-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            FM-GSO-09 – Repair & Maintenance
          </button>
          <button
            type="button"
            onClick={() => setRequestType('ppsr')}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              requestType === 'ppsr'
                ? 'border-teal-500 bg-teal-50 text-teal-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            FM-GSO-15 – Physical Plant Service
          </button>
        </div>
        <input type="hidden" name="request_type" value={requestType} />
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        {!state.success && state.errors?.title && (
          <p className="mt-1 text-xs text-red-600">{state.errors.title[0]}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm resize-none focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        {!state.success && state.errors?.description && (
          <p className="mt-1 text-xs text-red-600">{state.errors.description[0]}</p>
        )}
      </div>

      {/* RMR-specific: Category */}
      {requestType === 'rmr' && (
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-slate-700">
            Nature of Work
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category_name}
              </option>
            ))}
          </select>
          {!state.success && state.errors?.category_id && (
            <p className="mt-1 text-xs text-red-600">{state.errors.category_id[0]}</p>
          )}
        </div>
      )}

      {/* PPSR-specific: Service Type */}
      {requestType === 'ppsr' && (
        <div>
          <label htmlFor="service_type" className="block text-sm font-medium text-slate-700">
            Service Type
          </label>
          <select
            id="service_type"
            name="service_type"
            required
            value={selectedPpsrType}
            onChange={(e) => setSelectedPpsrType(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="">Select a service type</option>
            {PPSR_SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {PPSR_SERVICE_LABELS[type]}
              </option>
            ))}
          </select>
          {!state.success && state.errors?.service_type && (
            <p className="mt-1 text-xs text-red-600">{state.errors.service_type[0]}</p>
          )}

          {/* Dynamic sub‑fields for the selected service type */}
          {selectedPpsrType && <PpsrServiceDataForm serviceType={selectedPpsrType as any} />}
        </div>
      )}

      {/* Location */}
      <div>
        <label htmlFor="location_id" className="block text-sm font-medium text-slate-700">
          Location
        </label>
        <select
          id="location_id"
          name="location_id"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          <option value="">Select a location</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.building_name} {loc.room_number && `– ${loc.room_number}`}
            </option>
          ))}
        </select>
        {!state.success && state.errors?.location_id && (
          <p className="mt-1 text-xs text-red-600">{state.errors.location_id[0]}</p>
        )}
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