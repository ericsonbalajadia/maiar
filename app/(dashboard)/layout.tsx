// app/(dashboard)/layout.tsx
import DashboardContent from './dashboardContent';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <DashboardContent>{children}</DashboardContent>
    </div>
  );
}