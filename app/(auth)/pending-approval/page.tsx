// app/(auth)/pending-approval/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getRoleDashboard } from '@/lib/rbac'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function PendingApprovalPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  useEffect(() => {
    const checkApproval = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: dbUser } = await supabase
        .from('users')
        .select('role, signup_status')
        .eq('auth_id', user.id)
        .single()

      if (dbUser?.signup_status === 'approved') {
        router.push(getRoleDashboard(dbUser.role))
      }
    }

    // Check immediately, then every 30 seconds
    checkApproval()
    const interval = setInterval(checkApproval, 30000)

    return () => clearInterval(interval)
  }, [router, supabase])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Pending Approval</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-slate-400" />
        <p className="mt-4 text-slate-600">
          Your email has been confirmed. Your account is now awaiting approval.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          We will notify you via email once your account has been approved.
        </p>
        <p className="mt-8 text-xs text-slate-400">
          If you believe this is taking too long, please contact the IT department.
        </p>
        <Button className="mt-6" variant="outline" onClick={handleLogout}>
          Log out
        </Button>
      </CardContent>
    </Card>
  )
}