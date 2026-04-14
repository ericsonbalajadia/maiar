'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import type { DbUser } from '@/types/models'

interface AuthContextType {
  user: User | null
  dbUser: DbUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  dbUser: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [dbUser, setDbUser] = useState<DbUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)

  // Create supabase client only on client side
  useEffect(() => {
    const client = createClient()
    setSupabase(client)
  }, [])

  useEffect(() => {
    if (!supabase) return

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => {
      setUser(user)
      if (user) fetchDbUser(user.id)
      else setLoading(false)
    })

    // Subscribe to auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchDbUser(session.user.id)
        else {
          setDbUser(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  async function fetchDbUser(authId: string) {
    if (!supabase) return
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single()
    setDbUser(data)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, dbUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)