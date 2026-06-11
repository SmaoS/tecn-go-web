import { apiMessage } from '../api'

export function QueryState({ pending, error, empty, children }: {
  pending: boolean
  error: unknown
  empty?: boolean
  children: React.ReactNode
}) {
  if (pending) return <p className="rounded-xl bg-slate-900 p-4 text-slate-400">Cargando...</p>
  if (error) return <p className="rounded-xl bg-red-500/10 p-4 text-red-300">{apiMessage(error)}</p>
  if (empty) return <p className="text-slate-400">No hay información disponible.</p>
  return children
}
