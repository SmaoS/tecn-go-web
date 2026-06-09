import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import type { Role } from '../types'

export function ProtectedRoute() {
  const { session } = useAuth()
  return session ? <Outlet /> : <Navigate to="/login" replace />
}

export function RoleRouter() {
  const { session } = useAuth()
  if (!session) return <Navigate to="/login" replace />
  const route = { CLIENT: '/app/cliente', TECHNICIAN: '/app/tecnico', ADMIN: '/app/admin' }[session.role]
  return <Navigate to={route} replace />
}

export function RoleRoute({ role }: { role: Role }) {
  const { session } = useAuth()
  return session?.role === role ? <Outlet /> : <Navigate to="/app" replace />
}
