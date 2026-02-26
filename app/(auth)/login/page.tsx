'use client'

import { loginUser } from '@/actions/auth.actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useFormState } from 'react-dom'

type FormState = {
  error: {
    email?: string[]
    password?: string[]
    form?: string[]
  } | null
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const initialState: FormState = {
    error: null,
  }

  

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        {searchParams.error === 'account_inactive' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            Your account has been deactivated. Contact IT support.
          </div>
        )}

        <form action={loginUser} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input name="email" type="email" required />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <Input name="password" type="password" required />
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <div className="mt-4 text-center text-sm space-y-2">
          <p>
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>

          <Link
            href="/forgot-password"
            className="text-slate-500 hover:underline block"
          >
            Forgot password?
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}