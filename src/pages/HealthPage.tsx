import { useEffect, useState } from 'react'
import { api } from '../lib/api'

interface VersionInfo {
  name: string
  version: string
  environment: string
}

export function HealthPage() {
  const [info, setInfo] = useState<VersionInfo | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<VersionInfo>('/version')
      .then(({ data }) => setInfo(data))
      .catch(() => setError('Backend no disponible'))
  }, [])

  return <section className="mx-auto max-w-xl px-6 py-16">
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
      <h1 className="text-3xl font-black">Estado de TecnGo</h1>
      {info ? <div className="mt-6 space-y-2">
        <p className="font-bold text-emerald-400">Backend online</p>
        <p>Aplicación: {info.name}</p>
        <p>Versión: {info.version}</p>
        <p>Entorno: {info.environment}</p>
      </div> : <p className="mt-6 text-red-400">{error || 'Consultando backend...'}</p>}
    </div>
  </section>
}
