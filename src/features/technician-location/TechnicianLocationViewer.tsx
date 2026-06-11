import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { TechnicianLocation } from '../../types'

export function TechnicianLocationViewer({ requestId }: { requestId: string }) {
  const location = useQuery({
    queryKey: ['technician-location', requestId],
    queryFn: () => api.get<TechnicianLocation>(`/v1/service-requests/${requestId}/technician-location`).then(({ data }) => data),
    refetchInterval: 10_000,
    retry: false,
  })
  if (!location.data) return <p className="mt-3 text-xs text-slate-500">Esperando ubicación del técnico...</p>
  return <div className="mt-3 rounded-xl bg-slate-950/50 p-3 text-sm">
    <strong>{location.data.online ? 'Técnico en línea' : 'Última ubicación conocida'}</strong>
    <p className="text-slate-400">{location.data.latitude.toFixed(6)}, {location.data.longitude.toFixed(6)}</p>
    <time className="text-xs text-slate-500">{new Date(location.data.updatedAt).toLocaleString()}</time>
  </div>
}
