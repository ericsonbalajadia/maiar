import { getBacklogCounts, getTechnicianWorkload, getUserSummary } from '@/lib/queries/request.queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, ClipboardList, Wrench, Clock } from 'lucide-react';

export default async function ReportsPage() {
  const backlog = await getBacklogCounts();
  const technicians = await getTechnicianWorkload();
  const userSummary = await getUserSummary();

  const backlogData = [
    { label: 'Pending + Under Review', value: (backlog.data?.pending || 0) + (backlog.data?.under_review || 0), color: 'bg-yellow-500' },
    { label: 'Approved (Awaiting Assignment)', value: backlog.data?.approved || 0, color: 'bg-blue-500' },
    { label: 'Assigned + In Progress', value: (backlog.data?.assigned || 0) + (backlog.data?.in_progress || 0), color: 'bg-green-500' },
    { label: 'Completed', value: backlog.data?.completed || 0, color: 'bg-teal-500' },
    { label: 'Cancelled', value: backlog.data?.cancelled || 0, color: 'bg-gray-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>

      {/* Backlog Analysis */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <ClipboardList className="h-5 w-5" /> Backlog Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {backlogData.map((item) => (
            <Card key={item.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Technician Workload Balance */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Wrench className="h-5 w-5" /> Technician Workload Balance
        </h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Active Assignments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.data?.length ? (
                technicians.data.map((tech: any) => (
                  <TableRow key={tech.id}>
                    <TableCell className="font-medium">{tech.name}</TableCell>
                    <TableCell>{tech.specialization}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-500" />
                        {tech.activeAssignments}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">No technicians found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* User Summary */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5" /> User Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userSummary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userSummary.pendingApprovals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Role Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(userSummary.byRole).map(([role, count]) => (
                  <div key={role} className="flex justify-between text-sm">
                    <span className="capitalize">{role}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}