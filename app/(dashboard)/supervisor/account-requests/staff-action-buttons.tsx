// app/(dashboard)/supervisor/account-requests/staff-action-buttons.tsx
"use client";

import { useActionState, useState } from "react";
import {
  approveUser,
  rejectUser,
  type UserActionState,
} from "@/actions/approve-user.action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";

const initialState: UserActionState = {};

interface StaffActionButtonsProps {
  userId: string;
  onSuccess?: () => void;
}

export function StaffActionButtons({ userId, onSuccess }: StaffActionButtonsProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // ── Approve ──────────────────────────────────────────────────────────────

  const [approveState, approveAction, approvePending] = useActionState(
    async (prevState: UserActionState) => {
      const result = await approveUser(userId);
      if (result.success) onSuccess?.();
      return result;
    },
    initialState
  );

  // ── Reject ───────────────────────────────────────────────────────────────

  const [rejectState, rejectAction, rejectPending] = useActionState(
    async (prevState: UserActionState, formData: FormData) => {
      const reason = rejectionReason || (formData.get("reason") as string);
      const result = await rejectUser(userId, reason || undefined);
      if (result.success) {
        setShowRejectDialog(false);
        setRejectionReason("");
        onSuccess?.();
      }
      return result;
    },
    initialState
  );

  return (
    <>
      <div className="flex items-center gap-2 shrink-0">
        {/* Approve */}
        <form action={approveAction}>
          <Button
            type="submit"
            size="sm"
            disabled={approvePending}
            className="h-8 px-3 gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm shadow-emerald-500/20 border-0 text-xs font-semibold"
          >
            {approvePending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            {approvePending ? "Approving…" : "Approve"}
          </Button>
          {approveState.error && (
            <p className="text-xs text-rose-500 mt-1">{approveState.error}</p>
          )}
        </form>

        {/* Decline */}
        <Button
          type="button"
          size="sm"
          disabled={rejectPending}
          onClick={() => setShowRejectDialog(true)}
          className="h-8 px-3 gap-1.5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 shadow-sm text-xs font-semibold"
        >
          {rejectPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          {rejectPending ? "Declining…" : "Decline"}
        </Button>
      </div>

      {/* ── Decline dialog ── */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent
          className="max-w-md rounded-2xl border border-white/60 dark:border-slate-700/60 shadow-2xl p-0 overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Dialog header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                Decline Registration
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Optionally provide a reason for declining this staff registration.
              </DialogDescription>
            </div>
          </div>

          {/* Dialog body */}
          <form action={rejectAction} className="px-5 py-4 space-y-3">
            <Textarea
              placeholder="Reason for declining (optional)…"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px] resize-none bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition-all text-sm placeholder:text-slate-400"
            />
            {rejectState.error && (
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
                {rejectState.error}
              </p>
            )}

            <DialogFooter className="gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRejectDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={rejectPending}
                className="flex-1 gap-1.5 bg-rose-600 hover:bg-rose-700 text-white border-0"
              >
                {rejectPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                {rejectPending ? "Declining…" : "Confirm Decline"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}