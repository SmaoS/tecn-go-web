import { useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Session } from '../types'
import { AuthContext } from './auth-context'
import { api } from '../lib/api'
import { setObservedUser } from '../lib/observability'
import { useEffect } from 'react'
import { clearStoredSession, normalizeSession, readStoredSession, storeSession } from './sessionStorage'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, updateSession] = useState<Session | null>(readStoredSession)
  useEffect(() => setObservedUser(session?.userId, session?.role), [session])

  const value = useMemo(() => ({
    session,
    setSession: (next: Session) => {
      const normalized = normalizeSession(next)
      storeSession(normalized)
      updateSession(normalized)
    },
    switchMode: async (mode: 'CLIENT' | 'TECHNICIAN') => {
      if (!session) return null
      const { data } = await api.put<{
        token: string
        roles?: Session['roles']
        activeMode: 'CLIENT' | 'TECHNICIAN'
        roleCreated: boolean
        onboardingCompleted: boolean
      }>('/v1/users/me/active-mode', { mode })
      const next = normalizeSession({
        ...session,
        token: data.token,
        roles: data.roles ?? session.roles,
        activeMode: data.activeMode,
        role: data.activeMode,
        onboardingCompleted: data.onboardingCompleted,
      })
      storeSession(next)
      updateSession(next)
      queryClient.clear()
      return next
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
  }), [queryClient, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
