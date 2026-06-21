import { useMemo, useState, type ReactNode } from 'react'
import type { Session } from '../types'
import { AuthContext } from './auth-context'
import { api } from '../lib/api'
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
    logout: async () => {
      try {
        await api.post('/v1/auth/logout')
      } catch {
        // Local logout must continue when the backend is unavailable.
      } finally {
        localStorage.removeItem(key)
        updateSession(null)
      }
    },
  }), [session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
