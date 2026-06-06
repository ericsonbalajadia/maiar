import { CheckCircle2, Wrench, Zap } from "lucide-react";

export const SECTIONS = [
  {
    key: "approved",
    label: "Approved",
    sub: "Ready to assign a technician",
    icon: CheckCircle2,
    countBg: "bg-[#0D3311]/10 text-[#0D3311] dark:bg-white/[0.06] dark:text-emerald-300",
    chipBg: "border-[#0D3311]/20 bg-[#0D3311]/10 text-[#0D3311] dark:border-white/10 dark:bg-white/[0.06] dark:text-emerald-300",
    emptyText: "No approved requests awaiting assignment.",
  },
  {
    key: "assigned",
    label: "Assigned",
    sub: "Technician assigned, schedule pending",
    icon: Wrench,
    countBg: "bg-blue-100 text-blue-700 dark:bg-white/[0.06] dark:text-blue-300",
    chipBg: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/40 dark:bg-white/[0.06] dark:text-blue-300",
    emptyText: "No assigned requests.",
  },
  {
    key: "in_progress",
    label: "In Progress",
    sub: "Work is actively underway",
    icon: Zap,
    countBg: "bg-[#0D3311]/10 text-[#0D3311] dark:bg-white/[0.06] dark:text-emerald-300",
    chipBg: "border-[#0D3311]/20 bg-[#0D3311]/10 text-[#0D3311] dark:border-white/10 dark:bg-white/[0.06] dark:text-emerald-300",
    emptyText: "No requests currently in progress.",
  },
];
