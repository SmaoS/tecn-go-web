import { useEffect, useMemo } from 'react'

const playStoreUrl = import.meta.env.VITE_PLAY_STORE_URL
  ?? 'https://play.google.com/store/apps/details?id=com.tecngo'
const appStoreUrl = import.meta.env.VITE_APP_STORE_URL
  ?? 'https://apps.apple.com/'

function platformStoreUrl() {
  const userAgent = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(userAgent)) return appStoreUrl
  if (/android/.test(userAgent)) return playStoreUrl
  return playStoreUrl
}

function nativeUrl(path: string) {
  const normalized = path.startsWith('/') ? path.slice(1) : path
  return `tecngo:///${normalized}`
}

export function AppOpenPage() {
  const params = new URLSearchParams(window.location.search)
  const targetPath = params.get('path') || '/app'
  const appUrl = useMemo(() => nativeUrl(targetPath), [targetPath])
  const webUrl = targetPath.startsWith('http') ? targetPath : targetPath

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.location.href = appUrl
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [appUrl])

  return <section className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-5 py-12 text-center">
    <div className="tecngo-panel p-8">
      <img src="/tecngo-logo-dark.png" alt="TecnGo" className="mx-auto mb-6 h-14 w-auto" />
      <h1 className="text-3xl font-extrabold">Abriendo TecnGo</h1>
      <p className="mt-3 text-slate-300">
        Si tienes la app instalada, se abrirá automáticamente. Si no ocurre, usa una de estas opciones.
      </p>
      <div className="mt-6 grid gap-3">
        <a href={appUrl} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">
          Abrir en la app
        </a>
        <a href={platformStoreUrl()} className="rounded-xl border border-brand-500 px-5 py-3 font-bold text-brand-300">
          Instalar TecnGo
        </a>
        <a href={webUrl} className="rounded-xl border border-slate-700 px-5 py-3 text-slate-200">
          Continuar en la web
        </a>
      </div>
    </div>
  </section>
}
