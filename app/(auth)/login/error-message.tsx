'use client'

import { useSearchParams } from 'next/navigation'

export function ErrorMessage() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const errorDesc = searchParams.get('error_description')

  if (errorParam === 'verification_failed') {
    return (
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
        {errorDesc || 'The confirmation link has expired. Please log in below – if your account is already approved you can log in directly.'}
      </div>
    )
  }

  if (errorParam === 'account_inactive') {
    return (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
        Your account has been deactivated. Contact IT support.
      </div>
    )
  }

  return null
}