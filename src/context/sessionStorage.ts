import type { Session } from '../types'

export const sessionStorageKey = 'tecngo.session'

export function normalizeSession(session: Session): Session {
  if (session.activeMode) return { ...session, role: session.activeMode }
  return session
}

export function readStoredSession(): Session | null {
  const raw = localStorage.getItem(sessionStorageKey)
  if (!raw) return null
  try {
    const session = normalizeSession(JSON.parse(raw) as Session)
    storeSession(session)
    return session
  } catch {
    localStorage.removeItem(sessionStorageKey)
    return null
  }
}

export function storeSession(session: Session) {
  localStorage.setItem(sessionStorageKey, JSON.stringify(normalizeSession(session)))
}

export function clearStoredSession() {
  localStorage.removeItem(sessionStorageKey)
}
