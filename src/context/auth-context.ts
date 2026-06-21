import { createContext } from 'react'
import type { Session } from '../types'

export interface AuthValue {
  session: Session | null
  setSession: (session: Session) => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthValue | null>(null)
