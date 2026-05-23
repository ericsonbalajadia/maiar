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

// Icons per service type
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
                  ? 'bg-[#8dc192] text-[#0b130b] shadow-[#ADEBB3]/40 dark:shadow-[#ADEBB3]/20'
                  : isCurrent
                  ? 'bg-[#8dc192] text-[#0b130b] shadow-[#ADEBB3]/40 dark:shadow-[#ADEBB3]/20'
                  : 'bg-slate-100 dark:bg-white/[0.05] text-slate-400 dark:text-white/45'
              )}>
                {isPast ? <Check className="h-4 w-4" /> : step.number}
              </div>
              <span className={cn(
                'text-xs text-center whitespace-nowrap font-medium',
                isCurrent ? 'text-[#527255] dark:text-emerald-300'
                  : isPast ? 'text-[#527255] dark:text-emerald-300'
                  : 'text-slate-400 dark:text-white/45'
              )}>
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mt-4 mx-2 rounded-full transition-all duration-300',
                step.number < current
                  ? 'bg-[#8dc192]'
                  : 'bg-[#ADEBB3]/60 dark:bg-white/[0.08]'
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
        className="rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-[#ADEBB3]/70 dark:border-white/10"
        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}
      >
        <div className="w-16 h-16 bg-[#8dc192] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#ADEBB3]/35">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Submitted!</h2>
        <p className="text-sm text-black dark:text-white/80 mb-2">
          Your request has been received and is pending review.
        </p>
        <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-white/[0.05] rounded-lg px-3 py-1.5 mb-6">
          <span className="text-xs text-slate-400">Ticket</span>
          <span className="text-sm font-bold font-mono text-slate-800 dark:text-white">{ticketNumber}</span>
        </div>
        <div className="flex flex-col gap-2.5">
          <Button
            onClick={onView}
            className="w-full bg-[#8dc192] text-[#0b130b] shadow-md shadow-[#ADEBB3]/35 hover:bg-[#ADEBB3]/35"
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
      <Label className="text-xs font-semibold text-slate-500 dark:text-white/60 uppercase tracking-wide mb-1.5 block">
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
      <div className="rounded-xl bg-slate-50/80 dark:bg-white/[0.04] border border-[#ADEBB3]/70 dark:border-white/10 px-4 py-6 text-center">
        <p className="text-sm text-slate-400 dark:text-white/45 italic">
          No additional fields required for this service type.
        </p>
      </div>
    )
  }

  const inputClass = 'h-10 bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all'

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
                className="resize-none min-h-[100px] bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all"
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
      className="rounded-2xl border border-[#ADEBB3]/70 dark:border-white/10 shadow-sm overflow-hidden"
      style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)' }}
    >
      {/* Progress bar */}
      <div className="h-1 bg-slate-100 dark:bg-white/[0.05]">
        <div
          className="h-full bg-[#8dc192] transition-all duration-500 ease-out rounded-full"
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>

      <div className="p-6 sm:p-8">
        <StepIndicator current={step} />

        {/* Step 1: Request Info */}
        {step === 1 && (
          <div className="fade-in">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-7 h-7 rounded-lg bg-[#8dc192] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <span className="text-xs font-bold text-[#1e2c1f]">1</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Request Information</h2>
                <p className="text-sm text-slate-500 dark:text-white/60 mt-0.5">
                  Tell us who you are and where the service is needed
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Date Filled">
                <Input value={form.date_filled} readOnly className="h-10 bg-slate-50/80 dark:bg-white/[0.05] text-slate-500 cursor-default border-[#ADEBB3]/70 dark:border-white/10" />
              </Field>

              <Field label="Building / Department" required error={errors.building}>
                <Input
                  placeholder="e.g. Engineering Block A"
                  value={form.building}
                  onChange={(e) => set('building', e.target.value)}
                  className={cn(
                    'h-10 bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all',
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
                        'h-10 bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all',
                        errors.location_building && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/20'
                      )}
                    />
                    <Input
                      placeholder="Floor level (optional)"
                      value={form.location_floor}
                      onChange={(e) => set('location_floor', e.target.value)}
                      className="h-10 bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all"
                    />
                    <Input
                      placeholder="Room number (optional)"
                      value={form.location_room}
                      onChange={(e) => set('location_room', e.target.value)}
                      className="h-10 bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all"
                    />
                  </div>
                </Field>
              </div>

              <Field label="Requesting Party Name" required error={errors.requesting_party}>
                <Input
                  value={form.requesting_party}
                  onChange={(e) => set('requesting_party', e.target.value)}
                  className={cn(
                    'h-10 bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all',
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
                    'h-10 bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all',
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
                    'h-10 bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all',
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
                    'h-10 bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all',
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
              <div className="w-7 h-7 rounded-lg bg-[#8dc192] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <span className="text-xs font-bold text-[#1e2c1f]">2</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Service Type</h2>
                <p className="text-sm text-slate-500 dark:text-white/60 mt-0.5">
                  Select the type of physical plant service you need
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PPSR_SERVICE_TYPES.map((type) => {
                const Icon       = SERVICE_ICONS[type] ?? MoreHorizontal
                const isSelected = form.service_type === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setServiceType(type)}
                    className={cn(
                      'group flex min-h-[58px] items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors duration-150',
                      isSelected
                        ? 'border-[#6f9873] bg-[#ADEBB3]/30 dark:border-emerald-300/45 dark:bg-white/[0.07]'
                        : 'border-[#ADEBB3]/70 bg-white/45 hover:border-[#6f9873]/70 hover:bg-[#ADEBB3]/20 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.07]'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150',
                        isSelected
                          ? 'border-[#527255] bg-[#527255] text-white dark:border-emerald-300 dark:bg-emerald-300 dark:text-[#101216]'
                          : 'border-[#ADEBB3]/70 text-transparent dark:border-white/15'
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150',
                      isSelected
                        ? 'border-[#6f9873]/70 bg-[#8dc192]/45 text-[#1e2c1f] dark:border-emerald-300/30 dark:bg-white/[0.08] dark:text-emerald-300'
                        : 'border-[#ADEBB3]/70 bg-white/70 text-[#527255] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60'
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className={cn(
                        'block truncate text-sm font-medium leading-tight',
                        isSelected ? 'text-[#1e2c1f] dark:text-white' : 'text-slate-700 dark:text-white/75'
                      )}>
                        {PPSR_SERVICE_LABELS[type]}
                      </span>
                    </div>
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
              <div className="w-7 h-7 rounded-lg bg-[#8dc192] flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-xs font-bold text-[#1e2c1f]">3</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Service Details</h2>
                <p className="text-sm text-slate-500 dark:text-white/60 mt-0.5">
                  {PPSR_SERVICE_LABELS[form.service_type]}
                </p>
              </div>
              <div className={cn(
                'ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#6f9873]/70 bg-[#8dc192]/45 text-[#1e2c1f] dark:border-emerald-300/30 dark:bg-white/[0.08] dark:text-emerald-300'
              )}>
                {(() => { const Icon = SERVICE_ICONS[form.service_type] ?? MoreHorizontal; return <Icon className="h-4 w-4" /> })()}
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-500 dark:text-white/60 uppercase tracking-wide mb-1.5 block">
                Request Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="Brief title for this request"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className={cn(
                  'h-10 bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all',
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
              <Label className="text-xs font-semibold text-slate-500 dark:text-white/60 uppercase tracking-wide mb-1.5 block">
                Additional Notes
              </Label>
              <Textarea
                placeholder="Any other details the team should know..."
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className="resize-none bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all"
              />
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="fade-in">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-7 h-7 rounded-lg bg-[#8dc192] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <span className="text-xs font-bold text-[#1e2c1f]">4</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Review &amp; Submit</h2>
                <p className="text-sm text-slate-500 dark:text-white/60 mt-0.5">
                  Please verify all details before submitting
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-[#ADEBB3]/70 dark:border-white/10 overflow-hidden bg-white/40 dark:bg-white/[0.04]">
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
                      i % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-white/[0.04]'
                    )}
                  >
                    <span className="text-slate-400 dark:text-white/45 min-w-[130px] shrink-0 text-xs font-semibold uppercase tracking-wide">{label}</span>
                    <span className="font-medium text-slate-700 dark:text-white/80">{value || '—'}</span>
                  </div>
                ))}
              </div>

              {form.service_type && Object.keys(form.service_data).length > 0 && (
                <div className="rounded-xl border border-[#ADEBB3]/70 dark:border-white/10 overflow-hidden bg-white/40 dark:bg-white/[0.04]">
                  {Object.entries(form.service_data)
                    .filter(([, v]) => v)
                    .map(([key, value], i) => (
                      <div
                        key={key}
                        className={cn(
                          'flex gap-4 px-4 py-2.5',
                          i % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-white/[0.04]'
                        )}
                      >
                        <span className="text-slate-400 dark:text-white/45 min-w-[130px] shrink-0 text-xs font-semibold uppercase tracking-wide">
                          {FIELD_LABELS[key] ?? key.replace(/_/g, ' ')}
                        </span>
                        <span className="font-medium text-slate-700 dark:text-white/80">{value}</span>
                      </div>
                    ))
                  }
                </div>
              )}

              <div className="rounded-xl border border-[#ADEBB3]/70 dark:border-white/10 px-4 py-3 bg-white/40 dark:bg-white/[0.04]">
                <p className="text-xs font-semibold text-slate-400 dark:text-white/45 uppercase tracking-wide mb-1">Title</p>
                <p className="font-semibold text-slate-800 dark:text-white">{form.title}</p>
                {form.description && (
                  <>
                    <p className="text-xs font-semibold text-slate-400 dark:text-white/45 uppercase tracking-wide mt-3 mb-1">Additional Notes</p>
                    <p className="text-slate-600 dark:text-white/60 leading-relaxed">{form.description}</p>
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
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#ADEBB3]/70 dark:border-white/10">
          {step === 1 ? (
            <Button type="button" variant="outline" onClick={cancel} className="text-slate-500 border-[#ADEBB3]/70 dark:border-white/10">
              Cancel
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={back} className="gap-1.5 text-slate-500 border-[#ADEBB3]/70 dark:border-white/10">
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
                      ? 'w-4 h-2 bg-[#527255]'
                      : s.number < step
                      ? 'w-2 h-2 bg-[#8dc192]'
                      : 'w-2 h-2 bg-[#ADEBB3]/60 dark:bg-white/[0.08]'
                  )}
                />
              ))}
            </div>

            {step < 4 ? (
              <Button
                type="button"
                onClick={next}
                className="bg-[#8dc192] text-[#0b130b] shadow-md shadow-[#ADEBB3]/35 hover:bg-[#ADEBB3]/35 gap-1.5 transition-all"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="bg-[#8dc192] text-[#0b130b] shadow-md shadow-[#ADEBB3]/35 hover:bg-[#ADEBB3]/35 min-w-[130px] transition-all"
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
