import { ThemeSwitcher } from "@/components/common/theme-switcher";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#101216]">
      <div className="absolute right-4 top-4">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#ADEBB3]/60 bg-white/70 shadow-sm shadow-[#ADEBB3]/45 dark:bg-white/[0.03]">
            <Image
              src="/itrack-logo.png"
              alt="iTrack"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            iTrack
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            VSU Maintenance Request System
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
