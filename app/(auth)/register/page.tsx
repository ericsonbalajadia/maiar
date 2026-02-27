// app/(auth)/register/page.tsx
'use client'

import { useActionState } from 'react'
import { registerUser, type RegisterState } from '@/actions/auth.actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

const initialState: RegisterState = {
  errors: {},
}

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerUser, initialState)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <p className="text-sm text-slate-500">
          Your account will be reviewed by an admin before you can access the system.
        </p>
      </CardHeader>
      <CardContent>
        {state.errors?.form && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {state.errors.form.join(', ')}
          </div>
        )}
        <form action={formAction} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <Input name="full_name" required placeholder="Juan dela Cruz" />
            {state.errors?.full_name && (
              <p className="text-sm text-red-600 mt-1">{state.errors.full_name[0]}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input name="email" type="email" required placeholder="you@vsu.edu.ph" />
            {state.errors?.email && (
              <p className="text-sm text-red-600 mt-1">{state.errors.email[0]}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input name="password" type="password" required />
            {state.errors?.password && (
              <p className="text-sm text-red-600 mt-1">{state.errors.password[0]}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">I am a</label>
            <Select name="role" required>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="staff">University Staff</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.role && (
              <p className="text-sm text-red-600 mt-1">{state.errors.role[0]}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Department (optional)</label>
            <Input name="department" placeholder="e.g. College of Engineering" />
            {state.errors?.department && (
              <p className="text-sm text-red-600 mt-1">{state.errors.department[0]}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}