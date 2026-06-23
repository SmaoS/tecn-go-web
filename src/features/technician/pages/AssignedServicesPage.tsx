import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/useAuth'
import type { RequestStatus, ServiceRequest } from '../../../types'
import { ChatPanel } from '../../chat/ChatPanel'
import { RequestList } from '../../service-requests/components'
import { QueryState } from '../../shared/components/QueryState'
import { technicianApi } from '../api'
import { useAssignedServices, useTechnicianAction, useTechnicianRatingStatuses } from '../hooks'
import { RatingPhraseChips } from '../../ratings/RatingPhraseChips'
import { buildRatingComment } from '../../ratings/ratingPhrases'

type RatingDraft = {
  score: number
  comment: string
  selectedPhrases: string[]
}

export function AssignedServicesPage() {
  const { session } = useAuth()
  const [chatRequest, setChatRequest] = useState<ServiceRequest | null>(null)
  const [locationOnline, setLocationOnline] = useState(false)
  const [error, setError] = useState('')
  const [ratings, setRatings] = useState<Record<string, RatingDraft>>({})
  const requests = useAssignedServices()
  const ratingStatuses = useTechnicianRatingStatuses((requests.data ?? []).filter((item) => item.status === 'PAID').map((item) => item.id))
  const action = useTechnicianAction()
  function advance(item: ServiceRequest) {
    const next: Partial<Record<RequestStatus, RequestStatus>> = {
      QUOTE_ACCEPTED: 'ON_THE_WAY', ON_THE_WAY: 'ARRIVED',
      ARRIVED: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED',
    }
    if (next[item.status]) action.mutate(() => technicianApi.advance(item.id, next[item.status]!))
  }
  function rateClient(item: ServiceRequest) {
    const draft = ratings[item.id] ?? { score: 5, comment: '', selectedPhrases: [] }
    action.mutate(() => technicianApi.rate(
      item.id,
      draft.score,
      buildRatingComment(draft.selectedPhrases, draft.comment),
    ))
  }
  useEffect(() => {
    if (!locationOnline || !navigator.geolocation) return
    let active = true
    const send = () => {
      if (document.visibilityState !== 'visible') return
      navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      if (!active) return
      try {
        await technicianApi.location({
          latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy,
          speed: coords.speed, heading: coords.heading, online: true,
        })
        setError('')
      } catch {
        setError('La ubicación fue obtenida, pero el servidor no pudo actualizarla.')
      }
    }, (reason) => {
      const messages: Record<number, string> = {
        1: 'Permiso de ubicación denegado. Habilítalo para este sitio en el navegador.',
        2: 'El dispositivo no pudo determinar la ubicación.',
        3: 'La ubicación tardó demasiado. Intenta en un lugar con mejor señal.',
      }
      setError(messages[reason.code] ?? 'No fue posible actualizar la ubicación GPS')
      }, { enableHighAccuracy: false, timeout: 30_000, maximumAge: 15_000 })
    }
    send()
    const interval = window.setInterval(send, 10_000)
    const resume = () => {
      if (document.visibilityState === 'visible') send()
    }
    document.addEventListener('visibilitychange', resume)
    return () => {
      active = false
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', resume)
    }
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
    <QueryState pending={requests.isPending || ((requests.data ?? []).some((item) => item.status === 'PAID') && ratingStatuses.isPending)} error={requests.error ?? ratingStatuses.error}>
      <RequestList title="" items={requests.data ?? []} actionLabel={(item) => {
        const labels: Partial<Record<RequestStatus, string>> = { QUOTE_ACCEPTED: 'Voy en camino', ON_THE_WAY: 'Marcar llegada', ARRIVED: 'Iniciar servicio', IN_PROGRESS: 'Completar' }
        return item.status === 'PAID' && ratingStatuses.data?.[item.id] === false ? 'Calificar cliente' : labels[item.status]
      }} onAction={(item) => item.status === 'PAID' ? rateClient(item) : advance(item)} onChat={setChatRequest} />
      <div className="space-y-3">{(requests.data ?? []).filter((item) => item.status === 'PAID' && ratingStatuses.data?.[item.id] === false).map((item) => {
        const draft = ratings[item.id] ?? { score: 5, comment: '', selectedPhrases: [] }
        return <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <strong className="text-sm">Calificar cliente · {item.clientName}</strong>
          <select className="mt-2" value={draft.score} onChange={(event) => setRatings({ ...ratings, [item.id]: { ...draft, score: Number(event.target.value) } })}>
            {[5, 4, 3, 2, 1].map((score) => <option key={score} value={score}>{score} estrellas</option>)}
          </select>
          <div className="mt-2"><RatingPhraseChips audience="TECHNICIAN" selected={draft.selectedPhrases} onChange={(selectedPhrases) => setRatings({ ...ratings, [item.id]: { ...draft, selectedPhrases } })} /></div>
          <textarea className="mt-2" placeholder="Comentario personal opcional" value={draft.comment} onChange={(event) => setRatings({ ...ratings, [item.id]: { ...draft, comment: event.target.value } })} />
        </div>
      })}</div>
    </QueryState>
    {chatRequest && <ChatPanel request={chatRequest} currentUserId={session!.userId} onClose={() => setChatRequest(null)} />}
  </section>
}
