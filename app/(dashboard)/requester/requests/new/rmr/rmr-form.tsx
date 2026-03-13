'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createRequest } from '@/actions/request/request.actions'
import type { Category, Location } from '@/types/requests.model'
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
import { ChevronRight, ChevronLeft, Check, Loader2, CheckCircle2, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RmrFormProps {
  categories: Category[]
  locations:  Location[]
  dbUser:     DbUser
}

interface FormData {
  date_filled:       string
  building:          string
  location_id:       string
  requesting_party:  string
  designation:       string
  contact_number:    string
  email:             string
  category_ids:      string[]
  title:             string
  description:       string
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { number: 1, label: 'Request Info' },
  { number: 2, label: 'Nature of Work' },
  { number: 3, label: 'Description' },
  { number: 4, label: 'Submit' },
]

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

function SuccessModal({
  ticketNumber,
  onAnother,
  onView,
}: {
  ticketNumber: string
  onAnother: () => void
  onView: () => void
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
          <Button onClick={onView} className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900">
            View My Requests
          </Button>
          <Button onClick={onAnother} variant="outline" className="w-full">
            Submit Another
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export function RmrForm({ categories, locations, dbUser }: RmrFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep]     = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ticketNumber, setTicketNumber] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState<FormData>({
    date_filled:      today,
    building:         '',
    location_id:      '',
    requesting_party: dbUser.full_name,
    designation:      dbUser.department ?? '',
    contact_number:   dbUser.phone ?? '',
    email:            dbUser.email,
    category_ids:     [],
    title:            '',
    description:      '',
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
      if (!form.building.trim())         errs.building         = 'Required'
      if (!form.location_id)             errs.location_id      = 'Required'
      if (!form.requesting_party.trim()) errs.requesting_party = 'Required'
      if (!form.designation.trim())      errs.designation      = 'Required'
      if (!form.contact_number.trim())   errs.contact_number   = 'Required'
      if (!form.email.trim())            errs.email            = 'Required'
    }
    if (s === 2 && form.category_ids.length === 0)
      errs.category_ids = 'Please select at least one type of work'
    if (s === 3 && !form.title.trim())
      errs.title = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => { if (validateStep(step)) setStep((s) => s + 1) }
  const back = () => setStep((s) => s - 1)

  // Cancel always goes back to the type-selector
  const cancel = () => router.push('/requester/requests/new')

  const handleSubmit = () => {
    if (!validateStep(3)) return
    startTransition(async () => {
      const primaryCategory = categories.find((c) => form.category_ids.includes(c.id))
      const result = await createRequest('rmr', {
        title:         form.title,
        description:   form.description,
        category_id:   primaryCategory?.id ?? form.category_ids[0],
        location_id:   form.location_id,
        designation:   form.designation,
        contact_email: form.email,
      })
      if (result.success && result.ticketNumber) {
        setTicketNumber(result.ticketNumber)
      } else {
        setErrors({ submit: result.error ?? 'Submission failed. Please try again.' })
      }
    })
  }

  const resetForm = () => {
    setTicketNumber(null)
    setStep(1)
    setForm({
      date_filled: today, building: '', location_id: '',
      requesting_party: dbUser.full_name, designation: dbUser.department ?? '',
      contact_number: dbUser.phone ?? '', email: dbUser.email,
      category_ids: [], title: '', description: '',
    })
  }

  if (ticketNumber) {
    return (
      <SuccessModal
        ticketNumber={ticketNumber}
        onView={() => router.push('/requester/requests')}
        onAnother={resetForm}
      />
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-3xl mx-auto">
      <StepIndicator current={step} />

      {/* ── Step 1: Request Info ── */}
      {step === 1 && (
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-6">
            Step 1: Request Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">Date Filled</Label>
              <Input value={form.date_filled} readOnly className="bg-slate-50 dark:bg-slate-800 text-slate-500" />
            </div>
            <div>
              <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">
                Building / Department <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Engineering Block A"
                value={form.building}
                onChange={(e) => set('building', e.target.value)}
                className={errors.building ? 'border-rose-400' : ''}
              />
              {errors.building && <p className="text-xs text-rose-500 mt-1">{errors.building}</p>}
            </div>
            <div>
              <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">
                Location <span className="text-rose-500">*</span>
              </Label>
              <Select value={form.location_id} onValueChange={(v) => set('location_id', v)}>
                <SelectTrigger className={errors.location_id ? 'border-rose-400' : ''}>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
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
              <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">
                Requesting Party Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={form.requesting_party}
                onChange={(e) => set('requesting_party', e.target.value)}
                className={errors.requesting_party ? 'border-rose-400' : ''}
              />
              {errors.requesting_party && <p className="text-xs text-rose-500 mt-1">{errors.requesting_party}</p>}
            </div>
            <div>
              <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">
                Designation / Position <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Lab Technician"
                value={form.designation}
                onChange={(e) => set('designation', e.target.value)}
                className={errors.designation ? 'border-rose-400' : ''}
              />
              {errors.designation && <p className="text-xs text-rose-500 mt-1">{errors.designation}</p>}
            </div>
            <div>
              <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">
                Contact Number <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="09xxxxxxxxx"
                value={form.contact_number}
                onChange={(e) => set('contact_number', e.target.value)}
                className={errors.contact_number ? 'border-rose-400' : ''}
              />
              {errors.contact_number && <p className="text-xs text-rose-500 mt-1">{errors.contact_number}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">
                Email Address <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className={errors.email ? 'border-rose-400' : ''}
              />
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Nature of Work ── */}
      {step === 2 && (
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
            Step 2: Nature of Work
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            Please check and specify the nature of work requested:
          </p>
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const checked = form.category_ids.includes(cat.id)
                return (
                  <label
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none',
                      checked
                        ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    )}
                  >
                    <div className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                      checked
                        ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                    )}>
                      {checked && <Check className="h-2.5 w-2.5 text-white dark:text-slate-900" />}
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-tight">
                      {cat.category_name}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
          {errors.category_ids && (
            <p className="text-xs text-rose-500 mt-2">{errors.category_ids}</p>
          )}
          {form.category_ids.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.category_ids.map((id) => {
                const cat = categories.find((c) => c.id === id)
                return cat ? (
                  <span key={id} className="inline-flex items-center gap-1.5 text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2.5 py-1 rounded-full font-medium">
                    {cat.category_name}
                    <button type="button" onClick={() => toggleCategory(id)} className="hover:opacity-70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ) : null
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Description ── */}
      {step === 3 && (
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-6">
            Step 3: Description
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">
                Brief title of the work requested <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Faulty electrical outlets in Room 201"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className={errors.title ? 'border-rose-400' : ''}
              />
              {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
            </div>
            <div>
              <Label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">
                Brief description of the work requested
              </Label>
              <Textarea
                placeholder="Provide as much detail as possible..."
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className="min-h-[140px] resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Review & Submit ── */}
      {step === 4 && (
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-6">
            Step 4: Review &amp; Submit
          </h2>
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {[
                ['Building / Dept',   form.building],
                ['Location',          locations.find((l) => l.id === form.location_id)?.building_name ?? '—'],
                ['Requesting Party',  form.requesting_party],
                ['Designation',       form.designation],
                ['Contact',           form.contact_number],
                ['Email',             form.email],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-4 px-4 py-3">
                  <span className="text-slate-400 dark:text-slate-500 min-w-[140px] shrink-0">{label}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 break-all">{value || '—'}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
              <p className="text-slate-400 dark:text-slate-500 mb-2">Nature of Work</p>
              <div className="flex flex-wrap gap-2">
                {form.category_ids.map((id) => {
                  const cat = categories.find((c) => c.id === id)
                  return cat ? (
                    <span key={id} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full font-medium">
                      {cat.category_name}
                    </span>
                  ) : null
                })}
              </div>
            </div>
            {form.title && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
                <p className="text-slate-400 dark:text-slate-500 mb-1">Title</p>
                <p className="font-medium text-slate-700 dark:text-slate-300">{form.title}</p>
                {form.description && (
                  <>
                    <p className="text-slate-400 dark:text-slate-500 mt-3 mb-1">Description</p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{form.description}</p>
                  </>
                )}
              </div>
            )}
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
        {/* Left button: Cancel on step 1, Back on other steps */}
        {step === 1 ? (
          <Button type="button" variant="outline" onClick={cancel}>
            Cancel
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={back} className="gap-1.5">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}

        {step < 4 ? (
          <Button
            type="button"
            onClick={next}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 gap-1.5"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 min-w-[120px]"
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting…</>
            ) : 'Submit Request'}
          </Button>
        )}
      </div>
    </div>
  )
}