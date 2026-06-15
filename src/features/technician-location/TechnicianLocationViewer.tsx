import { useTechnicianLocation } from './hooks'

export function TechnicianLocationViewer({ requestId }: { requestId: string }) {
  const location = useTechnicianLocation(requestId)
  if (!location.data) return <p className="mt-3 text-xs text-slate-500">Esperando ubicación del técnico...</p>
  return <div className="mt-3 rounded-xl bg-slate-950/50 p-3 text-sm">
    <strong>{location.data.online ? 'Técnico en línea' : 'Última ubicación conocida'}</strong>
    <p className="text-slate-400">Ubicación protegida y actualizada en tiempo real.</p>
    <time className="text-xs text-slate-500">{new Date(location.data.updatedAt).toLocaleString()}</time>
  </div>
}
