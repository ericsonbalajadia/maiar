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
import type { Location } from '@/types/requests.model'
import type { DbUser } from '@/types/models'
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
  locations: Location[]
  dbUser:    DbUser
}

// Icons per service type (keyed to ppsr-service-types.ts)
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
  { number: 4, label: 'Submit' },
]

// Field label overrides for human-readable display in the form
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

// Fields that should render as <select> with Yes/No
const BOOLEAN_FIELDS = new Set(['with_lights'])

// Fields that should render as <textarea>
const TEXTAREA_FIELDS = new Set([
  'description_of_work',
  'description_of_installation',
  'specify',
])

// ─── Step indicator ───────────────────────────────────────────────────────────

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
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                isPast || isCurrent
                  ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600'
              )}>
                {isPast ? <Check className="h-4 w-4" /> : step.number}
              </div>
              <span className={cn(
                'text-xs text-center whitespace-nowrap',
                isCurrent ? 'font-semibold text-slate-900 dark:text-white'
                  : isPast ? 'text-slate-500 dark:text-slate-400'
                  : 'text-slate-300 dark:text-slate-600'
              )}>
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={cn(
                'flex-1 h-px mt-4 mx-2',
                step.number < current ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-700'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Success Modal ────────────────────────────────────────────────────────────

function SuccessModal({ ticketNumber, onAnother, onView }: {
  ticketNumber: string; onAnother: () => void; onView: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Submitted!</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Your request has been received.</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-mono mb-6">{ticketNumber}</p>
        <div className="flex flex-col gap-2">
          <Button onClick={onView} className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900">View My Requests</Button>
          <Button onClick={onAnother} variant="outline" className="w-full">Submit Another</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Dynamic service fields ───────────────────────────────────────────────────
// Renders fields defined in PPSR_SERVICE_FIELDS[serviceType]

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
      <p className="text-sm text-slate-400 italic">No additional fields required for this service type.</p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((field) => {
        const label = FIELD_LABELS[field] ?? field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        const value = serviceData[field] ?? ''

        if (BOOLEAN_FIELDS.has(field)) {
          return (
            <div key={field}>
              <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">{label}</Label>
              <Select value={value} onValueChange={(v) => onChange(field, v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )
        }

        if (TEXTAREA_FIELDS.has(field)) {
          return (
            <div key={field} className="sm:col-span-2">
              <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">{label}</Label>
              <Textarea
                placeholder={`Enter ${label.toLowerCase()}...`}
                value={value}
                onChange={(e) => onChange(field, e.target.value)}
                className="resize-none min-h-[100px]"
              />
            </div>
          )
        }

        // Detect date-like fields
        const isDate = field.includes('date') && !field.includes('date_time')
        const isDateTime = field.includes('date_time')
        const isNumber = field.includes('trips') || field.includes('tents') || field.includes('hrs')

        return (
          <div key={field}>
            <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">{label}</Label>
            <Input
              type={isDateTime ? 'datetime-local' : isDate ? 'date' : isNumber ? 'number' : 'text'}
              placeholder={`Enter ${label.toLowerCase()}...`}
              value={value}
              onChange={(e) => onChange(field, e.target.value)}
            />
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export function PpsrForm({ locations, dbUser }: PpsrFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep]     = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ticketNumber, setTicketNumber] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const [form, setFormState] = useState({
    date_filled:      today,
    building:         '',
    location_id:      '',
    requesting_party: dbUser.full_name,
    designation:      dbUser.department ?? '',
    contact_number:   dbUser.phone ?? '',
    email:            dbUser.email,
    service_type:     '' as PpsrServiceType | '',
    service_data:     {} as Record<string, string>,
    title:            '',
    description:      '',
  })

  const set = (key: string, value: string) => {
    setFormState((f) => ({ ...f, [key]: value }))
    setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  // Reset service_data when service type changes
  const setServiceType = (type: PpsrServiceType) => {
    setFormState((f) => ({ ...f, service_type: type, service_data: {} }))
    setErrors((e) => { const n = { ...e }; delete n['service_type']; return n })
  }

  const setServiceData = (key: string, value: string) =>
    setFormState((f) => ({ ...f, service_data: { ...f.service_data, [key]: value } }))

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {}
    if (s === 1) {
      if (!form.building.trim())         errs.building         = 'Required'
      if (!form.location_id)             errs.location_id      = 'Required'
      if (!form.requesting_party.trim()) errs.requesting_party = 'Required'
      if (!form.designation.trim())      errs.designation      = 'Required'
      if (!form.contact_number.trim())   errs.contact_number   = 'Required'
      if (!form.email.trim())            errs.email            = 'Required'
    }
    if (s === 2 && !form.service_type)
      errs.service_type = 'Please select a service type'
    if (s === 3 && !form.title.trim())
      errs.title = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next   = () => { if (validateStep(step)) setStep((s) => s + 1) }
  const back   = () => setStep((s) => s - 1)
  const cancel = () => router.push('/requester/requests/new')

  const handleSubmit = () => {
    if (!validateStep(3)) return
    startTransition(async () => {
      const result = await createRequest('ppsr', {
        title:        form.title,
        description:  form.description,
        location_id:  form.location_id,
        designation:  form.designation,
        contact_email: form.email,
        service_type: form.service_type as PpsrServiceType,
        service_data: form.service_data,
      })
      if (result.success && result.ticketNumber) {
        setTicketNumber(result.ticketNumber)
      } else {
        setErrors({ submit: result.error ?? 'Submission failed. Please try again.' })
      }
    })
  }

  if (ticketNumber) {
    return (
      <SuccessModal
        ticketNumber={ticketNumber}
        onView={() => router.push('/requester/requests')}
        onAnother={() => { setTicketNumber(null); setStep(1) }}
      />
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-3xl mx-auto">
      <StepIndicator current={step} />

      {/* ── Step 1: Request Info ── */}
      {step === 1 && (
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-6">Step 1: Request Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">Date Filled</Label>
              <Input value={form.date_filled} readOnly className="bg-slate-50 dark:bg-slate-800 text-slate-500" />
            </div>
            <div>
              <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">Building / Department <span className="text-rose-500">*</span></Label>
              <Input placeholder="e.g. Engineering Block A" value={form.building} onChange={(e) => set('building', e.target.value)} className={errors.building ? 'border-rose-400' : ''} />
              {errors.building && <p className="text-xs text-rose-500 mt-1">{errors.building}</p>}
            </div>
            <div>
              <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">Location <span className="text-rose-500">*</span></Label>
              <Select value={form.location_id} onValueChange={(v) => set('location_id', v)}>
                <SelectTrigger className={errors.location_id ? 'border-rose-400' : ''}><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.building_name}{loc.room_number ? ` – Room ${loc.room_number}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location_id && <p className="text-xs text-rose-500 mt-1">{errors.location_id}</p>}
            </div>
            <div>
              <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">Requesting Party Name <span className="text-rose-500">*</span></Label>
              <Input value={form.requesting_party} onChange={(e) => set('requesting_party', e.target.value)} className={errors.requesting_party ? 'border-rose-400' : ''} />
            </div>
            <div>
              <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">Designation / Position <span className="text-rose-500">*</span></Label>
              <Input placeholder="e.g. Lab Technician" value={form.designation} onChange={(e) => set('designation', e.target.value)} className={errors.designation ? 'border-rose-400' : ''} />
            </div>
            <div>
              <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">Contact Number <span className="text-rose-500">*</span></Label>
              <Input placeholder="09xxxxxxxxx" value={form.contact_number} onChange={(e) => set('contact_number', e.target.value)} className={errors.contact_number ? 'border-rose-400' : ''} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">Email Address <span className="text-rose-500">*</span></Label>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={errors.email ? 'border-rose-400' : ''} />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Service Type ── */}
      {step === 2 && (
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Step 2: Service Type</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Select the type of physical plant service you need:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PPSR_SERVICE_TYPES.map((type) => {
              const Icon       = SERVICE_ICONS[type] ?? MoreHorizontal
              const isSelected = form.service_type === type
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setServiceType(type)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all',
                    isSelected
                      ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',
                    isSelected ? 'bg-slate-900 dark:bg-white' : 'bg-slate-100 dark:bg-slate-800'
                  )}>
                    <Icon className={cn('h-5 w-5', isSelected ? 'text-white dark:text-slate-900' : 'text-slate-500 dark:text-slate-400')} />
                  </div>
                  <span className={cn('text-xs font-medium leading-tight',
                    isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                  )}>
                    {PPSR_SERVICE_LABELS[type]}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-slate-900 dark:text-white" />}
                </button>
              )
            })}
          </div>
          {errors.service_type && <p className="text-xs text-rose-500 mt-3">{errors.service_type}</p>}
        </div>
      )}

      {/* ── Step 3: Service Details ── */}
      {step === 3 && form.service_type && (
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Step 3: Service Details</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {PPSR_SERVICE_LABELS[form.service_type]}
            </p>
          </div>
          <div>
            <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">Request Title <span className="text-rose-500">*</span></Label>
            <Input placeholder="Brief title for this request" value={form.title} onChange={(e) => set('title', e.target.value)} className={errors.title ? 'border-rose-400' : ''} />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
          </div>
          <ServiceSubFields
            serviceType={form.service_type}
            serviceData={form.service_data}
            onChange={setServiceData}
          />
          <div>
            <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">Additional Notes</Label>
            <Textarea placeholder="Any other details the team should know..." value={form.description} onChange={(e) => set('description', e.target.value)} className="resize-none" />
          </div>
        </div>
      )}

      {/* ── Step 4: Review ── */}
      {step === 4 && (
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-6">Step 4: Review &amp; Submit</h2>
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {[
                ['Building / Dept',  form.building],
                ['Location',         locations.find((l) => l.id === form.location_id)?.building_name ?? '—'],
                ['Requesting Party', form.requesting_party],
                ['Service Type',     form.service_type ? PPSR_SERVICE_LABELS[form.service_type] : '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-4 px-4 py-3">
                  <span className="text-slate-400 dark:text-slate-500 min-w-[140px] shrink-0">{label}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{value || '—'}</span>
                </div>
              ))}
            </div>

            {/* Service-specific data */}
            {form.service_type && Object.keys(form.service_data).length > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                {Object.entries(form.service_data)
                  .filter(([, v]) => v)
                  .map(([key, value]) => (
                    <div key={key} className="flex gap-4 px-4 py-3">
                      <span className="text-slate-400 dark:text-slate-500 min-w-[140px] shrink-0">
                        {FIELD_LABELS[key] ?? key.replace(/_/g, ' ')}
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{value}</span>
                    </div>
                  ))
                }
              </div>
            )}

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
              <p className="text-slate-400 dark:text-slate-500 mb-1">Title</p>
              <p className="font-medium text-slate-700 dark:text-slate-300">{form.title}</p>
              {form.description && (
                <>
                  <p className="text-slate-400 dark:text-slate-500 mt-3 mb-1">Additional Notes</p>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{form.description}</p>
                </>
              )}
            </div>
          </div>
          {errors.submit && (
            <p className="mt-4 text-sm text-rose-500 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg px-4 py-3">
              {errors.submit}
            </p>
          )}
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
        {step === 1 ? (
          <Button type="button" variant="outline" onClick={cancel}>Cancel</Button>
        ) : (
          <Button type="button" variant="outline" onClick={back} className="gap-1.5">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        )}
        {step < 4 ? (
          <Button type="button" onClick={next} className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 gap-1.5">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isPending} className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 min-w-[120px]">
            {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting…</> : 'Submit Request'}
          </Button>
        )}
      </div>
    </div>
  )
}