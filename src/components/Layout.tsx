import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { LoadingOverlay } from './LoadingOverlay'

export function Layout() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen flex-col">
      <LoadingOverlay />
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-canvas/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center" aria-label="TecnGo - Inicio">
            <img src="/tecngo-logo-dark.png" alt="TecnGo" className="h-9 w-auto sm:h-11" />
          </Link>
          <div className="flex items-center gap-2 text-sm sm:gap-4">
            {session ? (
              <>
                <Link to="/app" className="font-semibold text-slate-300 hover:text-white">Mi panel</Link>
                <button onClick={() => { logout(); navigate('/login') }} className="rounded-xl border border-slate-700 px-3 py-2 font-semibold hover:border-brand-500/60 hover:text-brand-300">Salir</button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-semibold text-slate-300 hover:text-white">Ingresar</Link>
                <Link to="/registro/cliente" className="rounded-xl bg-brand-500 px-3 py-2 font-extrabold text-canvas hover:bg-brand-300 sm:px-4">Registrarme</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-slate-800 bg-canvas/95">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-slate-400 sm:flex-row">
          <p>© 2026 TecnGo  Villavicencio</p>
          <nav aria-label="Enlaces legales" className="flex flex-wrap justify-center gap-4">
            <Link to="/privacy" className="hover:text-white">Privacidad</Link>
            <Link to="/data-collected" className="hover:text-white">Datos recolectados</Link>
            <Link to="/accessibility" className="hover:text-white">Accesibilidad</Link>
            <Link to="/terms" className="hover:text-white">Términos</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
