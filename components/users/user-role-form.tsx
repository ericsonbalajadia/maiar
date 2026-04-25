"use client";

import { useState, useTransition } from "react";
import { toggleUserActive } from "@/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Loader2, Info } from "lucide-react";

interface Props {
  userId: string;
  currentRole: string;
  isActive: boolean;
}

const roleColorMap: Record<string, string> = {
  student: "bg-blue-100 text-blue-700",
  staff: "bg-indigo-100 text-indigo-700",
  clerk: "bg-amber-100 text-amber-700",
  technician: "bg-teal-100 text-teal-700",
  supervisor: "bg-violet-100 text-violet-700",
  admin: "bg-rose-100 text-rose-700",
};

export function UserRoleForm({ userId, currentRole, isActive }: Props) {
  const [active, setActive] = useState(isActive);
  const [isPendingActive, startActive] = useTransition();
  const roleColor = roleColorMap[currentRole] || "bg-slate-100 text-slate-700";

  const handleToggleActive = () => {
    startActive(async () => {
      await toggleUserActive(userId, !active);
      setActive(!active);
    });
  };

  return (
    <div className="space-y-6">
      {/* Role section */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Role
          </label>
          <span title="Role is assigned during registration and cannot be changed by an admin.">
            <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
          </span>
        </div>
        <div>
          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${roleColor}`}>
            {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
          </span>
        </div>
      </div>

      {/* Account Status section */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Account Status
          </label>
          <span
            title={`${active ? "Active users can log in and access the system." : "Deactivated users cannot log in."}`}
          >
            <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
          </span>
        </div>
        <Button
          type="button"
          variant={active ? "destructive" : "default"}
          onClick={handleToggleActive}
          disabled={isPendingActive}
        >
          {isPendingActive ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {active ? "Deactivate Account" : "Activate Account"}
        </Button>
      </div>
    </div>
  );
}