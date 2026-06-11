import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../../context/useAuth'
import { NotificationCenter } from '../../notifications/NotificationCenter'
import { DashboardShell } from './DashboardShell'

export interface WorkspaceLink {
  to: string
  label: string
}

export function RoleWorkspace({ title, subtitle, links }: {
  title?: string
  subtitle: string
  links: WorkspaceLink[]
}) {
  const { session } = useAuth()
  return <DashboardShell title={title ?? `Hola, ${session?.fullName}`} subtitle={subtitle}>
    <NotificationCenter />
    <nav className="mb-8 flex flex-wrap gap-2">
      {links.map((link) => <NavLink key={link.to} to={link.to} className={({ isActive }) =>
        `rounded-lg border px-4 py-2 text-sm ${isActive ? 'border-brand-500 bg-brand-500/10 text-brand-300' : 'border-slate-700 text-slate-300'}`
      }>{link.label}</NavLink>)}
    </nav>
    <Outlet />
  </DashboardShell>
}
