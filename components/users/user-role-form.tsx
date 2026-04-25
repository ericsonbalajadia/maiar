"use client";

import { useState, useTransition } from "react";
import { updateUserRole, toggleUserActive } from "@/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Props {
  userId: string;
  currentRole: string;
  isActive: boolean;
}

const ROLES = ["student", "staff", "clerk", "technician", "supervisor", "admin"];

export function UserRoleForm({ userId, currentRole, isActive }: Props) {
  const [role, setRole] = useState(currentRole);
  const [active, setActive] = useState(isActive);
  const [isPendingRole, startRole] = useTransition();
  const [isPendingActive, startActive] = useTransition();

  const handleRoleChange = (newRole: string) => {
    if (newRole === role) return;
    startRole(async () => {
      await updateUserRole(userId, newRole);
      setRole(newRole);
    });
  };

  const handleToggleActive = () => {
    startActive(async () => {
      await toggleUserActive(userId, !active);
      setActive(!active);
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => handleRoleChange(r)}
              disabled={isPendingRole}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                role === r
                  ? "bg-rose-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
        {isPendingRole && <Loader2 className="h-4 w-4 animate-spin mt-2" />}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Status</label>
        <Button
          type="button"
          variant={active ? "destructive" : "default"}
          onClick={handleToggleActive}
          disabled={isPendingActive}
        >
          {isPendingActive ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {active ? "Deactivate Account" : "Activate Account"}
        </Button>
        <p className="text-xs text-slate-500 mt-1">
          {active ? "User can log in and access the system." : "User cannot log in."}
        </p>
      </div>
    </div>
  );
}