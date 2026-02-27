'use client'

import { Suspense, useActionState } from 'react'
import { loginUser, type LoginState } from '@/actions/auth.actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ErrorMessage } from './error-message'

const initialState: LoginState = {
  errors: {},
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginUser, initialState)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<p className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">Checking your session...</p>}>
          <ErrorMessage />
        </Suspense>

        {state.errors?.form && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {state.errors.form.join(', ')}
          </div>
        )}

        <form action={formAction} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm space-y-2">
          <p>
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
          <Link href="/forgot-password" className="text-slate-500 hover:underline block">
            Forgot password?
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}