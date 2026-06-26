import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../../context/useAuth'
import { NotificationCenter } from '../../notifications/NotificationCenter'
import { DashboardShell } from './DashboardShell'

export interface WorkspaceLink {
  to: string
  label: string
  primary?: boolean
}

export function RoleWorkspace({ title, subtitle, links }: {
  title?: string
  subtitle: string
  links: WorkspaceLink[]
}) {
  const { session } = useAuth()
  const location = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const explicitlyPrioritized = links.some((link) => link.primary)
  const primaryLinks = explicitlyPrioritized ? links.filter((link) => link.primary) : links.slice(0, 4)
  const secondaryLinks = explicitlyPrioritized ? links.filter((link) => !link.primary) : links.slice(4)
  const secondaryActive = secondaryLinks.some((link) =>
    location.pathname === link.to || location.pathname.startsWith(`${link.to}/`),
  )

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-xl border px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
      isActive
        ? 'border-brand-500 bg-brand-500/15 text-brand-300'
        : 'border-slate-700 bg-surface/60 text-slate-300 hover:border-slate-600 hover:text-white'
    }`

  return <DashboardShell title={title ?? `Hola, ${session?.fullName}`} subtitle={subtitle}>
    <NotificationCenter />
    <nav aria-label={`Navegación ${subtitle.toLowerCase()}`} className="mb-8 flex flex-wrap items-center gap-2">
      {primaryLinks.map((link) =>
        <NavLink key={link.to} to={link.to} className={linkClass}>{link.label}</NavLink>,
      )}
      {secondaryLinks.length > 0 && <div ref={menuRef} className="relative">
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen((open) => !open)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
            secondaryActive
              ? 'border-brand-500 bg-brand-500/15 text-brand-300'
              : 'border-slate-700 bg-surface/60 text-slate-300 hover:border-slate-600 hover:text-white'
          }`}
        >
          Más
          <span aria-hidden="true" className={`text-xs transition-transform ${menuOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {menuOpen && <div
          role="menu"
  className="absolute sm:right-0 sm:left-auto left-0 z-30 mt-2 grid max-h-[min(70vh,32rem)] w-72 gap-1 overflow-y-auto rounded-2xl border border-slate-700 bg-surface p-2 shadow-2xl shadow-black/40"
        >
          {secondaryLinks.map((link) =>
            <NavLink
              key={link.to}
              to={link.to}
              role="menuitem"
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-300'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>,
          )}
        </div>}
      </div>}
    </nav>
    <Outlet />
  </DashboardShell>
}
