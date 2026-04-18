//app/(dashboard)/requester/requests/new/ppsr/ppsr-form.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createRequest } from '@/actions/request/request.actions'
import {
  PPSR_SERVICE_TYPES,
  PPSR_SERVICE_LABELS,
  PPSR_SERVICE_FIELDS,
  type PpsrServiceType,
} from '@/lib/constants/ppsr-service-types'
import type { DbUser } from '@/types/models'
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  ChevronRight, ChevronLeft, Check, Loader2, CheckCircle2,
  Volume2, Truck, Trees, Hammer, Leaf, MoreHorizontal, MapPin,
  Wrench, Package, Settings, FileText,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PpsrFormProps {
  dbUser: DbUser
}

// Icons and colors per service type
const SERVICE_ICONS: Record<string, React.ElementType> = {
  audio_system:             Volume2,
  land_preparation:         Hammer,
  site_development:         MapPin,
  hauling:                  Truck,
  tent_installation:        Trees,
  fabrication:              Wrench,
  installation:             Package,
  machining_works:          Settings,
  landscaping:              Leaf,
  plans_layouts_estimates:  FileText,
  others:                   MoreHorizontal,
}

const SERVICE_COLORS: Record<string, string> = {
  audio_system:             'from-orange-400 to-red-500',
  land_preparation:         'from-amber-400 to-yellow-500',
  site_development:         'from-blue-400 to-cyan-500',
  hauling:                  'from-slate-400 to-slate-600',
  tent_installation:        'from-green-400 to-emerald-500',
  fabrication:              'from-violet-400 to-purple-500',
  installation:             'from-teal-400 to-cyan-600',
  machining_works:          'from-zinc-400 to-zinc-600',
  landscaping:              'from-lime-400 to-green-600',
  plans_layouts_estimates:  'from-indigo-400 to-blue-600',
  others:                   'from-rose-400 to-pink-500',
}

const STEPS = [
  { number: 1, label: 'Request Info' },
  { number: 2, label: 'Service Type' },
  { number: 3, label: 'Details' },
  { number: 4, label: 'Review' },
]

const FIELD_LABELS: Record<string, string> = {
  with_lights:               'With Lights?',
  setup_location:            'Setup Location',
  date_time_needed:          'Date & Time Needed',
  estimated_duration_hrs:    'Estimated Duration (hrs)',
  location_area:             'Location / Area',
  estimated_passing_trips:   'Estimated Passing Trips',
  location:                  'Location',
  from_location:             'From Location',
  to_location:               'To Location',
  number_of_tents:           'Number of Tents',
  tent_size:                 'Tent Size',
  description_of_work:       'Description of Work',
  description_of_installation: 'Description of Installation',
  machine_type:              'Machine Type',
  plan_type:                 'Plan Type',
  specify:                   'Please Specify',
}

const BOOLEAN_FIELDS = new Set(['with_lights'])
const TEXTAREA_FIELDS = new Set([
  'description_of_work',
  'description_of_installation',
  'specify',
])

// ─── Step indicator with progress bar ───────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-start mb-8">
      {STEPS.map((step, index) => {
        const isPast    = step.number < current
        const isCurrent = step.number === current
        return (
          <div key={step.number} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 shadow-sm',
                isPast
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-emerald-200 dark:shadow-emerald-900/30'
                  : isCurrent
                  ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-violet-200 dark:shadow-violet-900/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
              )}>
                {isPast ? <Check className="h-4 w-4" /> : step.number}
              </div>
              <span className={cn(
                'text-xs text-center whitespace-nowrap font-medium',
                isCurrent ? 'text-violet-600 dark:text-violet-400'
                  : isPast ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500'
              )}>
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mt-4 mx-2 rounded-full transition-all duration-300',
                step.number < current
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                  : 'bg-slate-200 dark:bg-slate-700'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Success Modal (glassmorphic) ───────────────────────────────────────────

function SuccessModal({
  ticketNumber,
  onAnother,
  onView,
}: {
  ticketNumber: string
  onAnother: () => void
  onView: () => void
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-white/20 dark:border-slate-700/60"
        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Submitted!</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          Your request has been received and is pending review.
        </p>
        <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 mb-6">
          <span className="text-xs text-slate-400">Ticket</span>
          <span className="text-sm font-bold font-mono text-slate-800 dark:text-white">{ticketNumber}</span>
        </div>
        <div className="flex flex-col gap-2.5">
          <Button
            onClick={onView}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20"
          >
            View My Requests
          </Button>
          <Button onClick={onAnother} variant="outline" className="w-full">
            Submit Another
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Field wrapper with label and error ──────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
  className,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Dynamic service fields (styled) ─────────────────────────────────────────

function ServiceSubFields({
  serviceType,
  serviceData,
  onChange,
}: {
  serviceType: PpsrServiceType
  serviceData: Record<string, string>
  onChange: (key: string, value: string) => void
}) {
  const fields = PPSR_SERVICE_FIELDS[serviceType] ?? []

  if (fields.length === 0) {
    return (
      <div className="rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 px-4 py-6 text-center">
        <p className="text-sm text-slate-400 dark:text-slate-500 italic">
          No additional fields required for this service type.
        </p>
      </div>
    )
  }

  const inputClass = 'h-10 bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((field) => {
        const label = FIELD_LABELS[field] ?? field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        const value = serviceData[field] ?? ''

        if (BOOLEAN_FIELDS.has(field)) {
          return (
            <Field key={field} label={label}>
              <Select value={value} onValueChange={(v) => onChange(field, v)}>
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )
        }

        if (TEXTAREA_FIELDS.has(field)) {
          return (
            <Field key={field} label={label} className="sm:col-span-2">
              <Textarea
                placeholder={`Enter ${label.toLowerCase()}...`}
                value={value}
                onChange={(e) => onChange(field, e.target.value)}
                className="resize-none min-h-[100px] bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
              />
            </Field>
          )
        }

        const isDate     = field.includes('date') && !field.includes('date_time')
        const isDateTime = field.includes('date_time')
        const isNumber   = field.includes('trips') || field.includes('tents') || field.includes('hrs')

        return (
          <Field key={field} label={label}>
            <Input
              type={isDateTime ? 'datetime-local' : isDate ? 'date' : isNumber ? 'number' : 'text'}
              placeholder={`Enter ${label.toLowerCase()}...`}
              value={value}
              onChange={(e) => onChange(field, e.target.value)}
              className={inputClass}
            />
          </Field>
        )
      })}
    </div>
  )
}

// ─── Main Form Component ──────────────────────────────────────────────────────

export function PpsrForm({ dbUser }: PpsrFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ticketNumber, setTicketNumber] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0]

  const [form, setFormState] = useState({
    date_filled:       today,
    building:          '',
    location_building: '',
    location_floor:    '',
    location_room:     '',
    requesting_party:  dbUser.full_name,
    designation:       dbUser.department ?? '',
    contact_number:    dbUser.phone ?? '',
    email:             dbUser.email,
    service_type:      '' as PpsrServiceType | '',
    service_data:      {} as Record<string, string>,
    title:             '',
    description:       '',
  })

  const set = (key: string, value: string) => {
    setFormState((f) => ({ ...f, [key]: value }))
    setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  const setServiceType = (type: PpsrServiceType) => {
    setFormState((f) => ({ ...f, service_type: type, service_data: {} }))
    setErrors((e) => { const n = { ...e }; delete n['service_type']; return n })
  }

  const setServiceData = (key: string, value: string) =>
    setFormState((f) => ({ ...f, service_data: { ...f.service_data, [key]: value } }))

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {}
    if (s === 1) {
      if (!form.building.trim())          errs.building          = 'Required'
      if (!form.location_building.trim()) errs.location_building = 'Required'
      if (!form.requesting_party.trim())  errs.requesting_party  = 'Required'
      if (!form.designation.trim())       errs.designation       = 'Required'
      if (!form.contact_number.trim())    errs.contact_number    = 'Required'
      if (!form.email.trim())             errs.email             = 'Required'
    }
    if (s === 2 && !form.service_type)
      errs.service_type = 'Please select a service type'
    if (s === 3 && !form.title.trim())
      errs.title = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => { if (validateStep(step)) setStep((s) => s + 1) }
  const back = () => setStep((s) => s - 1)
  const cancel = () => router.push('/requester/requests/new')




  const handleSubmit = () => {
    if (!validateStep(3)) return
    startTransition(async () => {
      const result = await createRequest('ppsr', {
        title:             form.title,
        description:       form.description,
        location_building: form.location_building,
        location_floor:    form.location_floor,
        location_room:     form.location_room,
        designation:       form.designation,
        contact_email:     form.email,
        service_type:      form.service_type as PpsrServiceType,
        service_data:      form.service_data,
      })
if (result.success && result.ticketNumber && result.requestId) {
  setTicketNumber(result.ticketNumber);
  setRequestId(result.requestId);
} else {
  setErrors({ submit: result.error ?? 'Submission failed. Please try again.' });
}
    })
  }

if (ticketNumber && requestId) {
  return (
    <SuccessModal
      ticketNumber={ticketNumber}
      onView={() => router.push(`/requester/requests/${requestId}`)}
      onAnother={() => { setTicketNumber(null); setRequestId(null); setStep(1); }}
    />
  );
}

  return (
    <div
      className="rounded-2xl border border-white/60 dark:border-slate-700/60 shadow-sm overflow-hidden"
      style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)' }}
    >
      {/* Progress bar */}
      <div className="h-1 bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>

      <div className="p-6 sm:p-8">
        <StepIndicator current={step} />

        {/* Step 1: Request Info */}
        {step === 1 && (
          <div className="fade-in">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <span className="text-xs font-bold text-white">1</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Request Information</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Tell us who you are and where the service is needed
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Date Filled">
                <Input value={form.date_filled} readOnly className="h-10 bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 cursor-default border-slate-200 dark:border-slate-700" />
              </Field>

              <Field label="Building / Department" required error={errors.building}>
                <Input
                  placeholder="e.g. Engineering Block A"
                  value={form.building}
                  onChange={(e) => set('building', e.target.value)}
                  className={cn(
                    'h-10 bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all',
                    errors.building && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/20'
                  )}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Location" required error={errors.location_building}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1.5">
                    <Input
                      placeholder="Building name *"
                      value={form.location_building}
                      onChange={(e) => set('location_building', e.target.value)}
                      className={cn(
                        'h-10 bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all',
                        errors.location_building && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/20'
                      )}
                    />
                    <Input
                      placeholder="Floor level (optional)"
                      value={form.location_floor}
                      onChange={(e) => set('location_floor', e.target.value)}
                      className="h-10 bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
                    />
                    <Input
                      placeholder="Room number (optional)"
                      value={form.location_room}
                      onChange={(e) => set('location_room', e.target.value)}
                      className="h-10 bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
                    />
                  </div>
                </Field>
              </div>

              <Field label="Requesting Party Name" required error={errors.requesting_party}>
                <Input
                  value={form.requesting_party}
                  onChange={(e) => set('requesting_party', e.target.value)}
                  className={cn(
                    'h-10 bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all',
                    errors.requesting_party && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/20'
                  )}
                />
              </Field>

              <Field label="Designation / Position" required error={errors.designation}>
                <Input
                  placeholder="e.g. Lab Technician"
                  value={form.designation}
                  onChange={(e) => set('designation', e.target.value)}
                  className={cn(
                    'h-10 bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all',
                    errors.designation && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/20'
                  )}
                />
              </Field>

              <Field label="Contact Number" required error={errors.contact_number}>
                <Input
                  placeholder="09xxxxxxxxx"
                  value={form.contact_number}
                  onChange={(e) => set('contact_number', e.target.value)}
                  className={cn(
                    'h-10 bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all',
                    errors.contact_number && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/20'
                  )}
                />
              </Field>

              <Field label="Email Address" required error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  className={cn(
                    'h-10 bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all',
                    errors.email && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/20'
                  )}
                />
              </Field>
            </div>
          </div>
        )}

        {/* Step 2: Service Type */}
        {step === 2 && (
          <div className="fade-in">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <span className="text-xs font-bold text-white">2</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Service Type</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Select the type of physical plant service you need
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PPSR_SERVICE_TYPES.map((type) => {
                const Icon       = SERVICE_ICONS[type] ?? MoreHorizontal
                const color      = SERVICE_COLORS[type] ?? 'from-slate-400 to-slate-600'
                const isSelected = form.service_type === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setServiceType(type)}
                    className={cn(
                      'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all duration-200',
                      isSelected
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-md shadow-violet-500/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white/40 dark:bg-slate-800/40'
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shadow-sm',
                      `bg-gradient-to-br ${color}`
                    )}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className={cn(
                      'text-xs font-semibold leading-tight',
                      isSelected ? 'text-violet-700 dark:text-violet-300' : 'text-slate-600 dark:text-slate-400'
                    )}>
                      {PPSR_SERVICE_LABELS[type]}
                    </span>
                  </button>
                )
              })}
            </div>

            {errors.service_type && (
              <p className="text-xs text-rose-500 mt-3 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
                {errors.service_type}
              </p>
            )}
          </div>
        )}

        {/* Step 3: Service Details */}
        {step === 3 && form.service_type && (
          <div className="fade-in space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-xs font-bold text-white">3</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Service Details</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {PPSR_SERVICE_LABELS[form.service_type]}
                </p>
              </div>
              <div className={cn(
                'ml-auto w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                `bg-gradient-to-br ${SERVICE_COLORS[form.service_type] ?? 'from-violet-400 to-purple-500'}`
              )}>
                {(() => { const Icon = SERVICE_ICONS[form.service_type] ?? MoreHorizontal; return <Icon className="h-4 w-4 text-white" /> })()}
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">
                Request Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="Brief title for this request"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className={cn(
                  'h-10 bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all',
                  errors.title && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/20'
                )}
              />
              {errors.title && <p className="text-xs text-rose-500 mt-1.5">{errors.title}</p>}
            </div>

            <ServiceSubFields
              serviceType={form.service_type}
              serviceData={form.service_data}
              onChange={setServiceData}
            />

            <div>
              <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">
                Additional Notes
              </Label>
              <Textarea
                placeholder="Any other details the team should know..."
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className="resize-none bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
              />
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="fade-in">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <span className="text-xs font-bold text-white">4</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Review &amp; Submit</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Please verify all details before submitting
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden bg-white/40 dark:bg-slate-800/40">
                {[
                  ['Building / Dept',  form.building],
                  ['Location',         form.location_building],
                  ['Floor Level',      form.location_floor || '—'],
                  ['Room Number',      form.location_room  || '—'],
                  ['Requesting Party', form.requesting_party],
                  ['Service Type',     form.service_type ? PPSR_SERVICE_LABELS[form.service_type] : '—'],
                ].map(([label, value], i) => (
                  <div
                    key={label}
                    className={cn(
                      'flex gap-4 px-4 py-2.5',
                      i % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-800/30'
                    )}
                  >
                    <span className="text-slate-400 dark:text-slate-500 min-w-[130px] shrink-0 text-xs font-semibold uppercase tracking-wide">{label}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{value || '—'}</span>
                  </div>
                ))}
              </div>

              {form.service_type && Object.keys(form.service_data).length > 0 && (
                <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden bg-white/40 dark:bg-slate-800/40">
                  {Object.entries(form.service_data)
                    .filter(([, v]) => v)
                    .map(([key, value], i) => (
                      <div
                        key={key}
                        className={cn(
                          'flex gap-4 px-4 py-2.5',
                          i % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-800/30'
                        )}
                      >
                        <span className="text-slate-400 dark:text-slate-500 min-w-[130px] shrink-0 text-xs font-semibold uppercase tracking-wide">
                          {FIELD_LABELS[key] ?? key.replace(/_/g, ' ')}
                        </span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{value}</span>
                      </div>
                    ))
                  }
                </div>
              )}

              <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 px-4 py-3 bg-white/40 dark:bg-slate-800/40">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Title</p>
                <p className="font-semibold text-slate-800 dark:text-white">{form.title}</p>
                {form.description && (
                  <>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-3 mb-1">Additional Notes</p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{form.description}</p>
                  </>
                )}
              </div>
            </div>

            {errors.submit && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/60 px-4 py-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                {errors.submit}
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100 dark:border-slate-800/60">
          {step === 1 ? (
            <Button type="button" variant="outline" onClick={cancel} className="text-slate-500 border-slate-200 dark:border-slate-700">
              Cancel
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={back} className="gap-1.5 text-slate-500 border-slate-200 dark:border-slate-700">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          <div className="flex items-center gap-2">
            {/* Step dots */}
            <div className="flex items-center gap-1.5 mr-3">
              {STEPS.map((s) => (
                <div
                  key={s.number}
                  className={cn(
                    'rounded-full transition-all duration-200',
                    s.number === step
                      ? 'w-4 h-2 bg-violet-500'
                      : s.number < step
                      ? 'w-2 h-2 bg-emerald-400'
                      : 'w-2 h-2 bg-slate-200 dark:bg-slate-700'
                  )}
                />
              ))}
            </div>

            {step < 4 ? (
              <Button
                type="button"
                onClick={next}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md shadow-violet-500/20 gap-1.5 transition-all"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 min-w-[130px] transition-all"
              >
                {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting…</> : '✓ Submit Request'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}