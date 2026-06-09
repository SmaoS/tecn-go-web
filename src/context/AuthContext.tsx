import { useMemo, useState, type ReactNode } from 'react'
import type { Session } from '../types'
import { AuthContext } from './auth-context'
const key = 'tecngo.session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, updateSession] = useState<Session | null>(() => {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  })

  const value = useMemo(() => ({
    session,
    setSession: (next: Session) => {
      localStorage.setItem(key, JSON.stringify(next))
      updateSession(next)
    },
    logout: () => {
      localStorage.removeItem(key)
      updateSession(null)
    },
  }), [session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
