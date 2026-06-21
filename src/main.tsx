import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initializeObservability, Sentry } from './lib/observability'

initializeObservability()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-white">
      <section className="max-w-lg text-center">
        <h1 className="text-2xl font-bold">Ocurrió un error inesperado</h1>
        <p className="mt-3 text-slate-400">El incidente fue registrado. Recarga la página para continuar.</p>
      </section>
    </main>}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
