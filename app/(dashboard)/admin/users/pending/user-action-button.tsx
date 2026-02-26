// app/(dashboard)/admin/users/pending/UserActionButtons.tsx
'use client'

import { useActionState } from 'react'
import { approveUser, rejectUser, type UserActionState } from '@/actions/user.actions'
import { Button } from '@/components/ui/button'

const initialState: UserActionState = {}

export function UserActionButtons({ userId }: { userId: string }) {
  const [approveState, approveAction, approvePending] = useActionState(
    async (prevState: UserActionState, formData: FormData) => {
      return await approveUser(userId)
    },
    initialState
  )

  const [rejectState, rejectAction, rejectPending] = useActionState(
    async (prevState: UserActionState, formData: FormData) => {
      return await rejectUser(userId)
    },
    initialState
  )

  return (
    <div className="flex gap-2">
      <form action={approveAction}>
        <Button
          type="submit"
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={approvePending}
        >
          {approvePending ? 'Approving...' : 'Approve'}
        </Button>
        {approveState.error && (
          <p className="text-xs text-red-600 mt-1">{approveState.error}</p>
        )}
      </form>
      <form action={rejectAction}>
        <Button
          type="submit"
          size="sm"
          variant="destructive"
          disabled={rejectPending}
        >
          {rejectPending ? 'Rejecting...' : 'Reject'}
        </Button>
        {rejectState.error && (
          <p className="text-xs text-red-600 mt-1">{rejectState.error}</p>
        )}
      </form>
    </div>
  )
}