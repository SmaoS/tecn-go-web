import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import type { Role } from '../types'
import { roleHome } from '../routes/paths'

export function ProtectedRoute() {
  const { session } = useAuth()
  return session ? <Outlet /> : <Navigate to="/login" replace />
}

export function RoleRouter() {
  const { session } = useAuth()
  if (!session) return <Navigate to="/login" replace />
  return <Navigate to={roleHome[session.role]} replace />
}

export function RoleRoute({ role }: { role: Role }) {
  const { session } = useAuth()
  return session?.role === role ? <Outlet /> : <Navigate to="/app" replace />
}
