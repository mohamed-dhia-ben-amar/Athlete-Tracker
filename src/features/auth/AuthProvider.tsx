import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import { SITE_URL } from '../../constants/env'
import type { Session, User } from '@supabase/supabase-js'

export interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, sessionPayload) => {
      setSession(sessionPayload)
      setUser(sessionPayload?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signIn: async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        return { error }
      },
      signUp: async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: SITE_URL
          }
        })
        return { error }
      },
      signOut: async () => {
        await supabase.auth.signOut()
      }
    }),
    [loading, session, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
