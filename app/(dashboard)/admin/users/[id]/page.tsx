import { getAuthUser } from "@/lib/auth";
import { ROLES } from "@/lib/rbac";
import { createServiceClient } from "@/lib/supabase/service";
import { notFound } from "next/navigation";
import { getUserRequests } from "@/lib/queries/request.queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ChevronLeft,
  Mail,
  Building2,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { UserRoleForm } from "@/components/users/user-role-form";
import type { ElementType } from "react";

interface Props {
  params: Promise<{ id: string }>;
}

type UserRole =
  | "student"
  | "staff"
  | "clerk"
  | "technician"
  | "supervisor"
  | "admin";

interface User {
  id: string;
  full_name: string;
  role: UserRole;
  signup_status: string;
  email: string;
  department: string | null;
  created_at: string;
  is_active: boolean;
}

interface InfoRowProps {
  icon: ElementType;
  label: string;
  value: string;
}

export default async function AdminUserDetailPage({ params }: Props) {
  await getAuthUser([ROLES.ADMIN]);
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: user, error }: { data: User | null; error: unknown } =
    await supabase.from("users").select("*").eq("id", id).single();
  if (error || !user) notFound();

  const roleColors: Record<UserRole, string> = {
    student: "bg-blue-100 text-blue-700",
    staff: "bg-indigo-100 text-indigo-700",
    clerk: "bg-amber-100 text-amber-700",
    technician: "bg-teal-100 text-teal-700",
    supervisor: "bg-violet-100 text-violet-700",
    admin: "bg-rose-100 text-rose-700",
  };

  const userRequests = await getUserRequests(user.id, user.role);

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/admin" className="hover:text-slate-600">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/admin/users" className="hover:text-slate-600">
          Users
        </Link>
        <span>/</span>
        <span className="text-slate-600">{user.full_name}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-rose-500">
            User Profile
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {user.full_name}
          </h1>
        </div>
        <Link
          href="/admin/users"
          className="text-sm text-rose-600 hover:underline flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Users
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${roleColors[user.role] || "bg-slate-100 text-slate-700"}`}
            >
              {user.full_name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${roleColors[user.role]}`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    user.signup_status === "approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {user.signup_status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow
              icon={Building2}
              label="Department"
              value={user.department ?? "—"}
            />
            <InfoRow
              icon={Calendar}
              label="Joined"
              value={new Date(user.created_at).toLocaleDateString()}
            />
            <InfoRow
              icon={ShieldCheck}
              label="Active"
              value={user.is_active ? "Yes" : "No"}
            />
          </div>
        </div>
      </div>

      {userRequests.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {user.role === "technician"
                ? "Assigned Requests"
                : "Reviewed Requests"}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  {user.role === "clerk" && <TableHead>Decision</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRequests.map((req: any) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-mono text-xs">
                      <Link
                        href={`/admin/requests/${req.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {req.ticket_number}
                      </Link>
                    </TableCell>
                    <TableCell>{req.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {req.status?.status_name || "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs">
                      {new Date(req.related_at).toLocaleDateString("en-PH")}
                    </TableCell>
                    {user.role === "clerk" && (
                      <TableCell className="capitalize">
                        {req.decision || "—"}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {userRequests.length === 0 && (user.role === 'technician' || user.role === 'clerk') && (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center text-slate-500">
    <p className="text-sm">
      {user.role === 'technician'
        ? 'No requests have been assigned to this technician yet.'
        : 'This clerk has not reviewed any requests yet.'}
    </p>
  </div>
)}

      {user.role !== "technician" && user.role !== "clerk" && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center text-slate-500">
          <p>No request history available for this role.</p>
        </div>
      )}

      {/* Role and status management */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="text-base font-semibold mb-4">Administrative Actions</h2>
        <UserRoleForm
          userId={user.id}
          currentRole={user.role}
          isActive={user.is_active}
        />
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-slate-400 mt-0.5" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {value}
        </p>
      </div>
    </div>
  );
}
