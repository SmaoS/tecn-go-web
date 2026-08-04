import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/useAuth'
import { NotificationCenter } from '../../notifications/NotificationCenter'
import { DashboardShell } from './DashboardShell'
import { roleHome } from '../../../routes/paths'
import { apiMessage } from '../api'

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
  const { session, switchMode, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [switchingMode, setSwitchingMode] = useState(false)
  const [modeError, setModeError] = useState('')
  const explicitlyPrioritized = links.some((link) => link.primary)
  const primaryLinks = explicitlyPrioritized ? links.filter((link) => link.primary) : links.slice(0, 4)
  const secondaryLinks = explicitlyPrioritized ? links.filter((link) => !link.primary) : links.slice(4)
  const secondaryActive = secondaryLinks.some((link) =>
    location.pathname === link.to || location.pathname.startsWith(`${link.to}/`),
  )
  const currentMode = session?.activeMode ?? session?.role
  const targetMode = currentMode === 'CLIENT'
    ? 'TECHNICIAN'
    : currentMode === 'TECHNICIAN' ? 'CLIENT' : null

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

  async function changeMode() {
    if (!targetMode) return
    setModeError('')
    setSwitchingMode(true)
    try {
      const next = await switchMode(targetMode)
      setMenuOpen(false)
      if (!next) return
      navigate(next.onboardingCompleted ? roleHome[next.role] : '/app/onboarding')
    } catch (error) {
      setModeError(apiMessage(error))
    } finally {
      setSwitchingMode(false)
    }
  }

  async function logoutAndGo() {
    await logout()
    navigate('/login')
  }

  const mobileTitle = title ?? session?.fullName ?? 'TecnGo'
  const mobileBottomLinks = primaryLinks.slice(0, 4)

  return <DashboardShell title={title ?? `Hola, ${session?.fullName}`} subtitle={subtitle}>
    <div className="md:hidden">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-800/80 bg-canvas/95 px-4 pb-3 pt-[calc(.75rem+var(--tecngo-safe-top))] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="tecngo-touch-target grid rounded-2xl border border-slate-700 bg-surface place-items-center text-xl font-black"
          >
            ☰
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold uppercase tracking-[.12em] text-brand-400">{subtitle}</p>
            <h1 className="truncate text-lg font-extrabold">{mobileTitle}</h1>
          </div>
          <NotificationCenter compact />
        </div>
      </header>

      {menuOpen && <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" role="presentation">
        <aside
          ref={menuRef}
          className="h-full w-[min(22rem,86vw)] overflow-y-auto border-r border-slate-800 bg-canvas px-4 pb-[calc(1rem+var(--tecngo-safe-bottom))] pt-[calc(1rem+var(--tecngo-safe-top))] shadow-2xl"
          aria-label={`Menú ${subtitle.toLowerCase()}`}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <img src="/tecngo-isotipo.png" alt="" className="h-11 w-11 rounded-2xl bg-surface p-2" />
              <div className="min-w-0">
                <strong className="block truncate">{session?.fullName ?? 'TecnGo'}</strong>
                <span className="text-xs text-slate-400">{subtitle}</span>
              </div>
            </div>
            <button type="button" onClick={() => setMenuOpen(false)} className="tecngo-touch-target rounded-xl border border-slate-700">×</button>
          </div>
          <nav className="grid gap-2">
            {links.map((link) => <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-2xl border px-4 py-3 text-sm font-bold ${
                  isActive ? 'border-brand-500 bg-brand-500/15 text-brand-300' : 'border-slate-800 bg-surface/70 text-slate-200'
                }`
              }
            >
              {link.label}
            </NavLink>)}
            {targetMode && <button
              type="button"
              disabled={switchingMode}
              onClick={() => void changeMode()}
              className="rounded-2xl border border-brand-500/60 bg-brand-500/10 px-4 py-3 text-left text-sm font-bold text-brand-300 disabled:opacity-50"
            >
              {switchingMode ? 'Cambiando modo...' : targetMode === 'TECHNICIAN' ? 'Modo técnico' : 'Modo cliente'}
            </button>}
          </nav>
          <button
            type="button"
            onClick={() => void logoutAndGo()}
            className="mt-6 w-full rounded-2xl border border-red-500/50 px-4 py-3 text-left text-sm font-bold text-red-200"
          >
            Cerrar sesión
          </button>
        </aside>
      </div>}

      <nav
        aria-label={`Navegación inferior ${subtitle.toLowerCase()}`}
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 gap-1 border-t border-slate-800/80 bg-canvas/95 px-2 pb-[calc(.5rem+var(--tecngo-safe-bottom))] pt-2 backdrop-blur-xl"
      >
        {mobileBottomLinks.map((link) => <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `rounded-2xl px-2 py-2 text-center text-[11px] font-extrabold leading-tight ${
              isActive ? 'bg-brand-500 text-canvas' : 'text-slate-400'
            }`
          }
        >
          {link.label}
        </NavLink>)}
      </nav>
    </div>

    <div className="hidden md:block">
      <NotificationCenter />
    </div>
    {modeError && <p className="mb-3 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{modeError}</p>}
    <nav aria-label={`Navegación ${subtitle.toLowerCase()}`} className="mb-8 hidden flex-wrap items-center gap-2 md:flex">
      {primaryLinks.map((link) =>
        <NavLink key={link.to} to={link.to} className={linkClass}>{link.label}</NavLink>,
      )}
      {targetMode && <button
        type="button"
        disabled={switchingMode}
        onClick={() => void changeMode()}
        className="rounded-xl border border-brand-500/60 bg-brand-500/10 px-4 py-2.5 text-sm font-semibold text-brand-300 transition-colors hover:bg-brand-500/15 hover:text-brand-200 disabled:opacity-50"
      >
        {switchingMode ? 'Cambiando modo...' : targetMode === 'TECHNICIAN' ? 'Modo técnico' : 'Modo cliente'}
      </button>}
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
          {targetMode && <>
            <div className="my-1 border-t border-slate-800" />
            <button
              type="button"
              role="menuitem"
              disabled={switchingMode}
              onClick={() => void changeMode()}
              className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-brand-300 transition-colors hover:bg-slate-800 hover:text-brand-200 disabled:opacity-50"
            >
              {switchingMode ? 'Cambiando modo...' : targetMode === 'TECHNICIAN' ? 'Modo técnico' : 'Modo cliente'}
            </button>
          </>}
        </div>}
      </div>}
    </nav>
    <div className="tecngo-mobile-page pt-[calc(4.75rem+var(--tecngo-safe-top))] md:pt-0 md:pb-0">
      <Outlet />
    </div>
  </DashboardShell>
}
