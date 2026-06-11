import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function Layout() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-950/90">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 text-2xl font-black tracking-tight text-white">
            <img src="/logo-tecno-go-app.png" alt="TecnGo" className="h-11 w-11 rounded-xl object-cover" />
            <span>Tecn<span className="text-brand-400">Go</span></span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {session ? (
              <>
                <Link to="/app" className="text-slate-300 hover:text-white">Mi panel</Link>
                <button onClick={() => { logout(); navigate('/login') }} className="rounded-lg border border-slate-700 px-3 py-2">Salir</button>
              </>
            ) : (
              <>
                <Link to="/login">Ingresar</Link>
                <Link to="/registro/cliente" className="rounded-lg bg-brand-500 px-4 py-2 font-bold text-slate-950">Registrarme</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main><Outlet /></main>
    </div>
  )
}
