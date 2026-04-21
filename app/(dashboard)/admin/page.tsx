//app/(dashboard)/admin/page.tsx
import { getAuthUser } from '@/lib/auth'
import { ROLES } from '@/lib/rbac'

export default async function AdminPage() {
  const { profile } = await getAuthUser([ROLES.ADMIN])
  return <div>Hello {profile.full_name}</div>
}