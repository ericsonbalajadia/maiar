//app/(dashboard)/supervisor/page.tsx
import { getAuthUser } from '@/lib/auth'
import { SUPERVISOR_ASSIGNMENT_ROLES } from '@/lib/rbac'
import { getRequestsForSupervisor } from '@/lib/queries/request.queries'
import { RequestCard } from '@/components/requests/request-card'

export default async function SupervisorDashboardPage() {
  await getAuthUser(SUPERVISOR_ASSIGNMENT_ROLES)

  const { data: requests } = await getRequestsForSupervisor()

  const approved = requests?.filter((r) => r.status.status_name === 'approved') ?? []
  const assigned = requests?.filter((r) => r.status.status_name === 'assigned') ?? []
  const inProgress = requests?.filter((r) => r.status.status_name === 'in_progress') ?? []

  const getHref = (statusName: string, id: string) => `/supervisor/requests/${id}`

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Supervisor Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Requests awaiting assignment or verification
        </p>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-semibold text-slate-700">Approved</h2>
          <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-700">
            {approved.length}
          </span>
        </div>
        {approved.length > 0 ? (
          <div className="space-y-3">
            {approved.map((r) => (
              <RequestCard key={r.id} request={r} fullHref={getHref(r.status.status_name, r.id)} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No approved requests.</p>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-semibold text-slate-700">Assigned</h2>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
            {assigned.length}
          </span>
        </div>
        {assigned.length > 0 ? (
          <div className="space-y-3">
            {assigned.map((r) => (
              <RequestCard key={r.id} request={r} fullHref={getHref(r.status.status_name, r.id)} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No assigned requests.</p>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-semibold text-slate-700">In Progress</h2>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
            {inProgress.length}
          </span>
        </div>
        {inProgress.length > 0 ? (
          <div className="space-y-3">
            {inProgress.map((r) => (
              <RequestCard key={r.id} request={r} fullHref={getHref(r.status.status_name, r.id)} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No requests in progress.</p>
        )}
      </section>
    </div>
  )
}