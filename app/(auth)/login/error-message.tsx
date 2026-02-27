'use client'

import { useSearchParams } from 'next/navigation'

export function ErrorMessage() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  if (errorParam !== 'account_inactive') return null

  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
      Your account has been deactivated. Contact IT support.
    </div>
  )
}