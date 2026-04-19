//app/(dashboard)/supervisor/account-requests/staff-action-buttons.tsx
'use client'

import { useActionState, useState } from 'react'
import { approveUser, rejectUser, type UserActionState } from '@/actions/approve-user.action'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

const initialState: UserActionState = {}

interface StaffActionButtonsProps {
  userId: string
  onSuccess?: () => void
}

export function StaffActionButtons({ userId, onSuccess }: StaffActionButtonsProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const [approveState, approveAction, approvePending] = useActionState(
    async (prevState: UserActionState) => {
      const result = await approveUser(userId)
      if (result.success) {
        onSuccess?.()
      }
      return result
    },
    initialState
  )

  const [rejectState, rejectAction, rejectPending] = useActionState(
    async (prevState: UserActionState, formData: FormData) => {
      const reason = rejectionReason || formData.get('reason') as string
      const result = await rejectUser(userId, reason || undefined)
      if (result.success) {
        setShowRejectDialog(false)
        setRejectionReason('')
        onSuccess?.()
      }
      return result
    },
    initialState
  )

  return (
    <>
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
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => setShowRejectDialog(true)}
          disabled={rejectPending}
        >
          {rejectPending ? 'Declining...' : 'Decline'}
        </Button>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Decline Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this staff member's account request.
            </DialogDescription>
          </DialogHeader>
          <form action={rejectAction} className="space-y-4">
            <Textarea
              placeholder="Reason for declining..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-24"
            />
            {rejectState.error && (
              <p className="text-xs text-red-600">{rejectState.error}</p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={rejectPending}
              >
                {rejectPending ? 'Declining...' : 'Decline'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
