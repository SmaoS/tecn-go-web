import type { Session } from '../types'

export const sessionStorageKey = 'tecngo.session'

export function readStoredSession(): Session | null {
  const raw = localStorage.getItem(sessionStorageKey)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    localStorage.removeItem(sessionStorageKey)
    return null
  }
}

export function storeSession(session: Session) {
  localStorage.setItem(sessionStorageKey, JSON.stringify(session))
}

export function clearStoredSession() {
  localStorage.removeItem(sessionStorageKey)
}
