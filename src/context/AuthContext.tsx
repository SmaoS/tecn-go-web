import { useMemo, useState, type ReactNode } from 'react'
import type { Session } from '../types'
import { AuthContext } from './auth-context'
import { api } from '../lib/api'
import { setObservedUser } from '../lib/observability'
import { useEffect } from 'react'
import { clearStoredSession, normalizeSession, readStoredSession, storeSession } from './sessionStorage'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, updateSession] = useState<Session | null>(readStoredSession)
  useEffect(() => setObservedUser(session?.userId, session?.role), [session])

  const value = useMemo(() => ({
    session,
    setSession: (next: Session) => {
      const normalized = normalizeSession(next)
      storeSession(normalized)
      updateSession(normalized)
    },
    logout: async () => {
      try {
        await api.post('/v1/auth/logout')
      } catch {
        // Local logout must continue when the backend is unavailable.
      } finally {
        clearStoredSession()
        updateSession(null)
      }
    },
  }), [session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
