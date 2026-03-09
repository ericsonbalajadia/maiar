// app/(dashboard)/layout.tsx
import { Suspense } from 'react';
import DashboardContent from './dashboardContent';import { DashboardSkeleton } from '@/components/layout/dashboard-skeleton';


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="flex h-screen">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent>{children}</DashboardContent>
      </Suspense>
    </div>
  )
}