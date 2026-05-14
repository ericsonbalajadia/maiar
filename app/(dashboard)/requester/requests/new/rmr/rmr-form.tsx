'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { createRequest } from '@/actions/request/request.actions'
import type { Category } from '@/types/requests.model'
import type { DbUser } from '@/types/models'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RequestPhotoPicker, SelectedPhotoGrid, uploadRequestPhotos } from '@/components/requests/request-photo-picker'
import { cn } from '@/lib/utils'
import {
  ChevronRight, ChevronLeft, Check, Loader2, CheckCircle2, X,
  Building2, User, Phone, Mail,
  Wrench, Zap, Droplet, Fan, Hammer, Paintbrush, Droplets, Sofa,
  Key, DoorClosed, Square, Home, Lightbulb, Bug
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RmrFormProps {
  categories: Category[]
  dbUser: DbUser
}

interface FormData {
  date_filled:        string
  building:           string
  location_building:  string
  location_floor:     string
  location_room:      string
  requesting_party:   string
  designation:        string
  contact_number:     string
  email:              string
  category_ids:       string[]
  title:              string
  description:        string
}

const STEPS = [
  { number: 1, label: 'Request Info' },
  { number: 2, label: 'Nature of Work' },
  { number: 3, label: 'Description' },
  { number: 4, label: 'Review' },
]

// ─── Helpers for category formatting and icons ───────────────────────────────

function formatCategoryName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const categoryIcons: Record<string, React.ElementType> = {
  default: Wrench,
  electrical: Zap,
  plumbing: Droplet,
  hvac: Fan,
  aircon: Fan,
  carpentry: Hammer,
  woodwork: Hammer,
  painting: Paintbrush,
  cleaning: Droplets,
  furniture: Sofa,
  locksmith: Key,
  door: DoorClosed,
  window: DoorClosed,
  flooring: Square,
  roofing: Home,
  lighting: Lightbulb,
  pest: Bug,
}

function getCategoryIcon(categoryName: string): React.ElementType {
  const lower = categoryName.toLowerCase()
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (lower.includes(key)) return icon
  }
  return categoryIcons.default
}

// ─── Step indicator with progress bar ────────────────────────────────────────

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

// ─── Field wrapper with label, tooltip, error ─────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
  tip,
  className,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  tip?: string
  className?: string
}) {
  return (
    <div className={className}>
      <Label className="text-xs font-semibold text-slate-500 dark:text-white/60 uppercase tracking-wide mb-1.5 block">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        {tip && (
          <span
            className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#ADEBB3]/55 dark:bg-white/[0.07] text-slate-500 dark:text-white/60 text-[10px] cursor-help"
            data-tooltip={tip}
          >
            ?
          </span>
        )}
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

// ─── Input with icon (glass style) ───────────────────────────────────────────

function IconInput({
  icon: Icon,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ElementType
  error?: boolean
}) {
  if (!Icon) {
    return (
      <Input
        {...props}
        className={cn(
          'h-10 bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] dark:focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all',
          error && 'border-rose-400 dark:border-rose-500 focus:border-rose-400 focus:ring-rose-400/20',
          props.className
        )}
      />
    )
  }

  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-white/45 pointer-events-none" />
      <Input
        {...props}
        className={cn(
          'h-10 pl-9 bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] dark:focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all',
          error && 'border-rose-400 dark:border-rose-500 focus:border-rose-400 focus:ring-rose-400/20',
          props.className
        )}
      />
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ number, title, subtitle }: { number: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-7 h-7 rounded-lg bg-[#8dc192] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
        <span className="text-xs font-bold text-[#1e2c1f]">{number}</span>
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 dark:text-white/60 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── Portal Success Modal (centered, redirects to request detail) ─────────────

function SuccessModal({
  ticketNumber,
  onAnother,
  onView,
}: {
  ticketNumber: string
  onAnother: () => void
  onView: () => void
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

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
        <p className="text-sm text-black dark:text-white/80 mb-2">Your request has been received and is pending review.</p>
        <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-white/[0.05] rounded-lg px-3 py-1.5 mb-6">
          <span className="text-xs text-slate-400">Ticket</span>
          <span className="text-sm font-bold font-mono text-slate-800 dark:text-white">{ticketNumber}</span>
        </div>
        <div className="flex flex-col gap-2.5">
          <Button
            onClick={onView}
            className="w-full bg-[#8dc192] text-[#0b130b] shadow-md shadow-[#ADEBB3]/35 hover:bg-[#ADEBB3]/35"
          >
            View Request
          </Button>
          <Button onClick={onAnother} variant="outline" className="w-full">
            Submit Another
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Main Form Component ──────────────────────────────────────────────────────

export function RmrForm({ categories, dbUser }: RmrFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ticketNumber, setTicketNumber] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [photos, setPhotos] = useState<File[]>([])

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState<FormData>({
    date_filled:       today,
    building:          '',
    location_building: '',
    location_floor:    '',
    location_room:     '',
    requesting_party:  dbUser.full_name,
    designation:       dbUser.department ?? '',
    contact_number:    dbUser.phone ?? '',
    email:             dbUser.email,
    category_ids:      [],
    title:             '',
    description:       '',
  })

  const set = (key: keyof FormData, value: string | string[]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => { const n = { ...e }; delete n[key as string]; return n })
  }

  const toggleCategory = (id: string) =>
    set('category_ids',
      form.category_ids.includes(id)
        ? form.category_ids.filter((c) => c !== id)
        : [...form.category_ids, id]
    )

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
    if (s === 2 && form.category_ids.length === 0)
      errs.category_ids = 'Please select at least one type of work'
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
      const primaryCategory = categories.find((c) => form.category_ids.includes(c.id))
      const result = await createRequest('rmr', {
        title:             form.title,
        description:       form.description,
        category_id:       primaryCategory?.id ?? form.category_ids[0],
        location_building: form.location_building,
        location_floor:    form.location_floor,
        location_room:     form.location_room,
        designation:       form.designation,
        contact_email:     form.email,
      })
      if (result.success && result.ticketNumber && result.requestId) {
        try {
          await uploadRequestPhotos(result.requestId, photos)
        } catch (error) {
          setErrors({
            submit: error instanceof Error
              ? `Request was submitted, but photo upload failed: ${error.message}`
              : 'Request was submitted, but photo upload failed.',
          })
          return
        }
        setTicketNumber(result.ticketNumber)
        setRequestId(result.requestId)
      } else {
        setErrors({ submit: result.error ?? 'Submission failed. Please try again.' })
      }
    })
  }

  const resetForm = () => {
    setTicketNumber(null)
    setRequestId(null)
    setStep(1)
    setForm({
      date_filled: today, building: '',
      location_building: '', location_floor: '', location_room: '',
      requesting_party: dbUser.full_name, designation: dbUser.department ?? '',
      contact_number: dbUser.phone ?? '', email: dbUser.email,
      category_ids: [], title: '', description: '',
    })
    setPhotos([])
  }

  if (ticketNumber && requestId) {
    return (
      <SuccessModal
        ticketNumber={ticketNumber}
        onView={() => router.push(`/requester/requests/${requestId}`)}
        onAnother={resetForm}
      />
    )
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

        {/* ── Step 1: Request Info ── */}
        {step === 1 && (
          <div className="fade-in">
            <SectionHeader
              number={1}
              title="Request Information"
              subtitle="Tell us who you are and where the issue is located"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Date Filled">
                <IconInput
                  value={form.date_filled}
                  readOnly
                  className="bg-slate-50/80 dark:bg-white/[0.05] text-slate-500 cursor-default"
                />
              </Field>

              <Field label="Building / Department" required error={errors.building}>
                <IconInput
                  icon={Building2}
                  placeholder="e.g. Engineering Block A"
                  value={form.building}
                  onChange={(e) => set('building', e.target.value)}
                  error={!!errors.building}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Location" required error={errors.location_building} tip="Specify the exact location of the repair needed">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1.5">
                    <div>
                      <Input
                        placeholder="Building name *"
                        value={form.location_building}
                        onChange={(e) => set('location_building', e.target.value)}
                        className={cn(
                          'h-10 bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all',
                          errors.location_building && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/20'
                        )}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Floor level (optional)"
                        value={form.location_floor}
                        onChange={(e) => set('location_floor', e.target.value)}
                        className="h-10 bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all"
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Room number (optional)"
                        value={form.location_room}
                        onChange={(e) => set('location_room', e.target.value)}
                        className="h-10 bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all"
                      />
                    </div>
                  </div>
                </Field>
              </div>

              <Field label="Requesting Party Name" required error={errors.requesting_party}>
                <IconInput
                  icon={User}
                  value={form.requesting_party}
                  onChange={(e) => set('requesting_party', e.target.value)}
                  error={!!errors.requesting_party}
                />
              </Field>

              <Field label="Designation / Position" required error={errors.designation} tip="Your role or position in the university">
                <IconInput
                  placeholder="e.g. Lab Technician"
                  value={form.designation}
                  onChange={(e) => set('designation', e.target.value)}
                  error={!!errors.designation}
                />
              </Field>

              <Field label="Contact Number" required error={errors.contact_number}>
                <IconInput
                  icon={Phone}
                  placeholder="09xxxxxxxxx"
                  value={form.contact_number}
                  onChange={(e) => set('contact_number', e.target.value)}
                  error={!!errors.contact_number}
                />
              </Field>

              <Field label="Email Address" required error={errors.email}>
                <IconInput
                  icon={Mail}
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  error={!!errors.email}
                />
              </Field>
            </div>
          </div>
        )}

        {/* ── Step 2: Nature of Work (with formatted names and icons) ── */}
        {step === 2 && (
          <div className="fade-in">
            <SectionHeader
              number={2}
              title="Nature of Work"
              subtitle="Select all applicable types of work needed"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {categories.map((cat) => {
                const checked = form.category_ids.includes(cat.id);
                const displayName = formatCategoryName(cat.category_name);
                const Icon = getCategoryIcon(cat.category_name);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      'group flex min-h-[58px] items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors duration-150',
                      checked
                        ? 'border-[#6f9873] bg-[#ADEBB3]/30 dark:border-emerald-300/45 dark:bg-white/[0.07]'
                        : 'border-[#ADEBB3]/70 bg-white/45 hover:border-[#6f9873]/70 hover:bg-[#ADEBB3]/20 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.07]'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150',
                        checked
                          ? 'border-[#527255] bg-[#527255] text-white dark:border-emerald-300 dark:bg-emerald-300 dark:text-[#101216]'
                          : 'border-[#ADEBB3]/70 text-transparent dark:border-white/15'
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150',
                      checked
                        ? 'border-[#6f9873]/70 bg-[#8dc192]/45 text-[#1e2c1f] dark:border-emerald-300/30 dark:bg-white/[0.08] dark:text-emerald-300'
                        : 'border-[#ADEBB3]/70 bg-white/70 text-[#527255] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60'
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block truncate text-sm font-medium leading-tight',
                          checked ? 'text-[#1e2c1f] dark:text-white' : 'text-slate-700 dark:text-white/75'
                        )}
                      >
                        {displayName}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {errors.category_ids && (
              <p className="text-xs text-rose-500 mb-3 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
                {errors.category_ids}
              </p>
            )}

            {form.category_ids.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Selected</p>
                <div className="flex flex-wrap gap-2">
                  {form.category_ids.map((id) => {
                    const cat = categories.find((c) => c.id === id);
                    if (!cat) return null;
                    const displayName = formatCategoryName(cat.category_name);
                    const Icon = getCategoryIcon(cat.category_name);
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 text-xs bg-[#8dc192] text-[#0b130b] px-2.5 py-1 rounded-full font-medium shadow-sm"
                      >
                        <Icon className="h-2.5 w-2.5" />
                        {displayName}
                        <button
                          type="button"
                          onClick={() => toggleCategory(id)}
                          className="hover:bg-[#ADEBB3]/35 ml-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Description ── */}
        {step === 3 && (
          <div className="fade-in">
            <SectionHeader
              number={3}
              title="Describe the Issue"
              subtitle="Give the team enough detail to handle the repair effectively"
            />
            <div className="space-y-4">
              <Field label="Brief title of the work requested" required error={errors.title}>
                <Input
                  placeholder="e.g. Faulty electrical outlets in Room 201"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  className={cn(
                    'h-10 bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all',
                    errors.title && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/20'
                  )}
                />
              </Field>

              <Field label="Brief description of the work requested">
                <Textarea
                  placeholder="Provide as much detail as possible — when did it start, what symptoms, etc."
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  className="min-h-[140px] resize-none bg-white/60 dark:bg-white/[0.05] border-[#ADEBB3]/70 dark:border-white/10 focus:border-[#ADEBB3] focus:ring-2 focus:ring-[#ADEBB3]/35 transition-all"
                />
              </Field>

              <Field label="Photos">
                <RequestPhotoPicker files={photos} onChange={setPhotos} disabled={isPending} />
              </Field>

              <div className="rounded-xl bg-[#ADEBB3]/30 dark:bg-white/[0.05] border border-[#ADEBB3]/70 dark:border-white/10 px-4 py-3 text-xs text-[#527255] dark:text-emerald-300">
                💡 The more detail you provide, the faster and more accurately we can handle your request.
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Review & Submit ── */}
        {step === 4 && (
          <div className="fade-in">
            <SectionHeader
              number={4}
              title="Review &amp; Submit"
              subtitle="Please verify all details before submitting"
            />

            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-[#ADEBB3]/70 dark:border-white/10 overflow-hidden bg-white/40 dark:bg-white/[0.04]">
                {[
                  ['Building / Dept',  form.building],
                  ['Location',         form.location_building],
                  ['Floor Level',      form.location_floor || '—'],
                  ['Room Number',      form.location_room  || '—'],
                  ['Requesting Party', form.requesting_party],
                  ['Designation',      form.designation],
                  ['Contact',          form.contact_number],
                  ['Email',            form.email],
                ].map(([label, value], i) => (
                  <div
                    key={label}
                    className={cn(
                      'flex gap-4 px-4 py-2.5',
                      i % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-white/[0.04]'
                    )}
                  >
                    <span className="text-slate-400 dark:text-white/45 min-w-[130px] shrink-0 text-xs font-semibold uppercase tracking-wide">{label}</span>
                    <span className="font-medium text-slate-700 dark:text-white/80 break-all text-sm">{value || '—'}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-[#ADEBB3]/70 dark:border-white/10 px-4 py-3 bg-white/40 dark:bg-white/[0.04]">
                <p className="text-xs font-semibold text-slate-400 dark:text-white/45 uppercase tracking-wide mb-2">Nature of Work</p>
                <div className="flex flex-wrap gap-2">
                  {form.category_ids.map((id) => {
                    const cat = categories.find((c) => c.id === id);
                    if (!cat) return null;
                    const displayName = formatCategoryName(cat.category_name);
                    return (
                      <span key={id} className="text-xs bg-[#ADEBB3]/40 dark:bg-white/[0.07] text-[#1e2c1f] dark:text-emerald-300 px-2.5 py-1 rounded-full font-medium">
                        {displayName}
                      </span>
                    );
                  })}
                </div>
              </div>

              {form.title && (
                <div className="rounded-xl border border-[#ADEBB3]/70 dark:border-white/10 px-4 py-3 bg-white/40 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold text-slate-400 dark:text-white/45 uppercase tracking-wide mb-1">Title</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{form.title}</p>
                  {form.description && (
                    <>
                      <p className="text-xs font-semibold text-slate-400 dark:text-white/45 uppercase tracking-wide mt-3 mb-1">Description</p>
                      <p className="text-slate-600 dark:text-white/60 leading-relaxed">{form.description}</p>
                    </>
                  )}
                  {photos.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-slate-400 dark:text-white/45 uppercase tracking-wide mt-3 mb-1">Photos</p>
                      <SelectedPhotoGrid files={photos} />
                    </>
                  )}
                </div>
              )}
            </div>

            {errors.submit && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/60 px-4 py-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                {errors.submit}
              </div>
            )}
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#ADEBB3]/70 dark:border-white/10">
          {step === 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={cancel}
              className="text-slate-500 border-[#ADEBB3]/70 dark:border-white/10"
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={back}
              className="gap-1.5 text-slate-500 border-[#ADEBB3]/70 dark:border-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          <div className="flex items-center gap-2">
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
                {isPending
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting…</>
                  : '✓ Submit Request'
                }
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
