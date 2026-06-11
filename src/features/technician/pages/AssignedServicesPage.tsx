import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/useAuth'
import type { RequestStatus, ServiceRequest } from '../../../types'
import { ChatPanel } from '../../chat/ChatPanel'
import { RequestList } from '../../service-requests/components'
import { QueryState } from '../../shared/components/QueryState'
import { technicianApi } from '../api'
import { useAssignedServices, useTechnicianAction } from '../hooks'

export function AssignedServicesPage() {
  const { session } = useAuth()
  const [chatRequest, setChatRequest] = useState<ServiceRequest | null>(null)
  const [locationOnline, setLocationOnline] = useState(false)
  const [error, setError] = useState('')
  const requests = useAssignedServices()
  const action = useTechnicianAction()
  function advance(item: ServiceRequest) {
    const next: Partial<Record<RequestStatus, RequestStatus>> = {
      QUOTE_ACCEPTED: 'ON_THE_WAY', ON_THE_WAY: 'ARRIVED',
      ARRIVED: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED',
    }
    if (next[item.status]) action.mutate(() => technicianApi.advance(item.id, next[item.status]!))
  }
  function rateClient(item: ServiceRequest) {
    const score = Number(window.prompt('Calificación del cliente (1 a 5)', '5'))
    if (Number.isInteger(score) && score >= 1 && score <= 5) {
      action.mutate(() => technicianApi.rate(item.id, score, window.prompt('Comentario', '') ?? ''))
    }
  }
  useEffect(() => {
    if (!locationOnline || !navigator.geolocation) return
    let active = true
    const send = () => navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (active) void technicianApi.location({
        latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy,
        speed: coords.speed, heading: coords.heading, online: true,
      })
    }, () => setError('No fue posible actualizar la ubicación GPS'), { enableHighAccuracy: true, timeout: 10_000 })
    send()
    const interval = window.setInterval(send, 10_000)
    return () => { active = false; window.clearInterval(interval) }
  }, [locationOnline])
  function toggleLocation() {
    if (locationOnline) {
      setLocationOnline(false)
      navigator.geolocation.getCurrentPosition(({ coords }) => void technicianApi.location({
        latitude: coords.latitude, longitude: coords.longitude, online: false,
      }))
    } else {
      setLocationOnline(true)
    }
  }

  return <section><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">Servicios asignados</h2><button onClick={toggleLocation} className={`rounded-lg px-4 py-2 font-bold ${locationOnline ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700'}`}>{locationOnline ? 'Ubicación activa · Desactivar' : 'Activar ubicación'}</button></div>
    {error && <p className="mb-4 text-red-300">{error}</p>}
    {action.error && <p className="mb-4 text-red-300">No fue posible actualizar el servicio.</p>}
    <QueryState pending={requests.isPending} error={requests.error}>
      <RequestList title="" items={requests.data ?? []} actionLabel={(item) => {
        const labels: Partial<Record<RequestStatus, string>> = { QUOTE_ACCEPTED: 'Ir en camino', ON_THE_WAY: 'Marcar llegada', ARRIVED: 'Iniciar servicio', IN_PROGRESS: 'Completar' }
        return item.status === 'PAID' ? 'Calificar cliente' : labels[item.status]
      }} onAction={(item) => item.status === 'PAID' ? rateClient(item) : advance(item)} onChat={setChatRequest} />
    </QueryState>
    {chatRequest && <ChatPanel request={chatRequest} currentUserId={session!.userId} onClose={() => setChatRequest(null)} />}
  </section>
}
