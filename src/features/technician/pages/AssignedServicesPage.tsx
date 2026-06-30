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
import { formatCopCurrency } from '../../../lib/format'
import { paymentMethodLabels } from '../../payments/paymentMethods'

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
  const [paymentRequest, setPaymentRequest] = useState<ServiceRequest | null>(null)
  const [ratingRequest, setRatingRequest] = useState<ServiceRequest | null>(null)
  const requests = useAssignedServices()
  const ratingStatuses = useTechnicianRatingStatuses((requests.data ?? []).filter((item) => item.status === 'PAID').map((item) => item.id))
  const action = useTechnicianAction()
  function advance(item: ServiceRequest) {
    const next: Partial<Record<RequestStatus, RequestStatus>> = {
      QUOTE_ACCEPTED: 'ON_THE_WAY', ON_THE_WAY: 'ARRIVED',
      ARRIVED: 'IN_PROGRESS',
    }
    if (item.status === 'IN_PROGRESS') {
      setPaymentRequest(item)
      return
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
  function confirmPayment(received: boolean) {
    if (!paymentRequest) return
    const request = paymentRequest
    action.mutate(
      () => technicianApi.technicianComplete(request.id, {
        paymentReceived: received,
        paymentMethod: request.requestedPaymentMethod,
        comment: received ? undefined : 'Problema de pago reportado por el técnico.',
      }),
      {
        onSuccess: () => {
          setPaymentRequest(null)
          if (received) setRatingRequest(request)
        },
      },
    )
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
    {paymentRequest && <PaymentConfirmationDialog
      request={paymentRequest}
      loading={action.isPending}
      onClose={() => setPaymentRequest(null)}
      onPaid={() => confirmPayment(true)}
      onUnpaid={() => confirmPayment(false)}
    />}
    {ratingRequest && <RatingDialog
      request={ratingRequest}
      draft={ratings[ratingRequest.id] ?? { score: 5, comment: '', selectedPhrases: [] }}
      loading={action.isPending}
      onDraft={(draft) => setRatings({ ...ratings, [ratingRequest.id]: draft })}
      onClose={() => setRatingRequest(null)}
      onSubmit={() => {
        const draft = ratings[ratingRequest.id] ?? { score: 5, comment: '', selectedPhrases: [] }
        action.mutate(
          () => technicianApi.rate(
            ratingRequest.id,
            draft.score,
            buildRatingComment(draft.selectedPhrases, draft.comment),
          ),
          { onSuccess: () => setRatingRequest(null) },
        )
      }}
    />}
  </section>
}

function PaymentConfirmationDialog({
  request,
  loading,
  onPaid,
  onUnpaid,
  onClose,
}: {
  request: ServiceRequest
  loading: boolean
  onPaid: () => void
  onUnpaid: () => void
  onClose: () => void
}) {
  const amount = request.finalPrice ?? request.technicianPrice ?? request.estimatedPrice
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4">
    <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
      <h3 className="text-2xl font-black">✓ Servicio finalizado</h3>
      <p className="mt-2 text-slate-400">¿El cliente pagó el valor acordado?</p>
      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm">
        <Info label="Cliente" value={request.clientName ?? 'Cliente'} />
        <Info label="Método de pago" value={paymentMethodLabels[request.requestedPaymentMethod] ?? request.requestedPaymentMethod} />
        <Info label="Valor acordado" value={formatCopCurrency(amount)} highlight />
      </div>
      <div className="mt-5 grid gap-3">
        <button disabled={loading} onClick={onPaid} className="rounded-xl bg-brand-500 px-4 py-3 font-black text-slate-950 disabled:opacity-60">Sí, recibí el pago</button>
        <button disabled={loading} onClick={onUnpaid} className="rounded-xl border border-red-500/60 bg-red-500/10 px-4 py-3 font-black text-red-200 disabled:opacity-60">No recibí el pago</button>
        <button disabled={loading} onClick={onClose} className="py-2 font-bold text-slate-400">Cancelar</button>
      </div>
    </div>
  </div>
}

function RatingDialog({
  request,
  draft,
  loading,
  onDraft,
  onClose,
  onSubmit,
}: {
  request?: ServiceRequest
  draft: RatingDraft
  loading: boolean
  onDraft: (draft: RatingDraft) => void
  onClose: () => void
  onSubmit: () => void
}) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4">
    <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
      <h3 className="text-2xl font-black">Califica al cliente</h3>
      <p className="mt-2 text-slate-400">Tu calificación ayuda a mantener una comunidad segura{request?.clientName ? ` · ${request.clientName}` : ''}.</p>
      <select className="mt-5" value={draft.score} onChange={(event) => onDraft({ ...draft, score: Number(event.target.value) })}>
        {[5, 4, 3, 2, 1].map((score) => <option key={score} value={score}>{score} estrellas</option>)}
      </select>
      <div className="mt-3"><RatingPhraseChips audience="TECHNICIAN" selected={draft.selectedPhrases} onChange={(selectedPhrases) => onDraft({ ...draft, selectedPhrases })} /></div>
      <textarea className="mt-3" placeholder="Comentario personal opcional" value={draft.comment} onChange={(event) => onDraft({ ...draft, comment: event.target.value })} />
      <div className="mt-5 grid gap-3">
        <button disabled={loading || !request} onClick={onSubmit} className="rounded-xl bg-brand-500 px-4 py-3 font-black text-slate-950 disabled:opacity-60">Enviar calificación</button>
        <button disabled={loading} onClick={onClose} className="py-2 font-bold text-slate-400">Calificar después</button>
      </div>
    </div>
  </div>
}

function Info({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="flex justify-between gap-4 py-2">
    <span className="text-slate-400">{label}</span>
    <strong className={highlight ? 'text-brand-400' : 'text-white'}>{value}</strong>
  </div>
}
