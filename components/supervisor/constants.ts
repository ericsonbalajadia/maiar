import { CheckCircle2, Wrench, Zap } from "lucide-react";

export const SECTIONS = [
  {
    key: "approved",
    label: "Approved",
    sub: "Ready to assign a technician",
    icon: CheckCircle2,
    countBg: "bg-[#ADEBB3]/45 text-[#374e39] dark:bg-white/[0.06] dark:text-emerald-300",
    chipBg: "border-[#ADEBB3]/70 bg-[#ADEBB3]/35 text-[#374e39] dark:border-white/10 dark:bg-white/[0.06] dark:text-emerald-300",
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
    countBg: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    chipBg: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800/40 dark:bg-violet-900/20 dark:text-violet-300",
    emptyText: "No requests currently in progress.",
  },
];