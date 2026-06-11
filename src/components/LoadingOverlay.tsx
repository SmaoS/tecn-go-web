import { useEffect, useState } from 'react'
import { subscribeApiLoading } from '../lib/api'

export function LoadingOverlay() {
  const [loading, setLoading] = useState(false)
  useEffect(() => subscribeApiLoading(setLoading), [])
  if (!loading) return null
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/70 backdrop-blur-sm" role="status" aria-live="polite">
    <div className="rounded-2xl border border-slate-700 bg-slate-900 px-8 py-6 text-center shadow-2xl">
      <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-brand-400" />
      <strong>Procesando...</strong>
    </div>
  </div>
}
