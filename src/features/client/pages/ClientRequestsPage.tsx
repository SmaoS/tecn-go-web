import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/useAuth'
import type { ServiceRequest } from '../../../types'
import { ChatPanel } from '../../chat/ChatPanel'
import { ImageGallery, Reputation, Status, Tracking } from '../../service-requests/components'
import { QueryState } from '../../shared/components/QueryState'
import { TechnicianLocationViewer } from '../../technician-location/TechnicianLocationViewer'
import { ServiceSupportPanel } from '../../service-support/ServiceSupportPanel'
import { clientApi } from '../api'
import { useClientQuotes, useClientRatingStatuses, useClientRequestAction, useClientRequests } from '../hooks'
import type { RatingDraft } from '../types'
import { formatCopCurrency } from '../../../lib/format'
import { RatingPhraseChips } from '../../ratings/RatingPhraseChips'
import { buildRatingComment } from '../../ratings/ratingPhrases'

export function ClientRequestsPage() {
  const { session } = useAuth()
  const [ratings, setRatings] = useState<Record<string, RatingDraft>>({})
  const [chatRequest, setChatRequest] = useState<ServiceRequest | null>(null)
  const [ratingRequest, setRatingRequest] = useState<ServiceRequest | null>(null)
  const [notice, setNotice] = useState('')
  const requests = useClientRequests()
  const quotes = useClientQuotes(requests.data?.map((item) => item.id) ?? [])
  const ratingStatuses = useClientRatingStatuses((requests.data ?? []).filter((item) => item.status === 'PAID').map((item) => item.id))
  const action = useClientRequestAction()

  useEffect(() => {
    if (!ratingStatuses.data || ratingRequest) return
    const pending = (requests.data ?? []).find((item) => item.status === 'PAID' && ratingStatuses.data?.[item.id] === false)
    if (pending) setRatingRequest(pending)
  }, [ratingRequest, ratingStatuses.data, requests.data])

  function submitRating(item: ServiceRequest, onSuccess?: () => void) {
    const draft = ratings[item.id] ?? { score: 5, comment: '', selectedPhrases: [] }
    action.mutate(() => clientApi.rate(item.id, { score: draft.score, comment: buildRatingComment(draft.selectedPhrases ?? [], draft.comment) }), {
      onSuccess: () => {
        setNotice('Calificación enviada.')
        onSuccess?.()
      },
    })
  }

  return <section><h2 className="mb-4 text-2xl font-bold">Mis solicitudes</h2>
    {notice && <p className="mb-4 text-sm text-emerald-400">{notice}</p>}
    {action.error && <p className="mb-4 text-sm text-red-400">No fue posible completar la operación.</p>}
    <QueryState pending={requests.isPending || ((requests.data?.length ?? 0) > 0 && quotes.isPending) || ((requests.data ?? []).some((item) => item.status === 'PAID') && ratingStatuses.isPending)} error={requests.error ?? quotes.error ?? ratingStatuses.error} empty={requests.data?.length === 0}>
      <div className="space-y-3">{requests.data?.map((item) => <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex justify-between gap-4"><strong>{item.categoryName}</strong><Status value={item.status} /></div>
        <p className="mt-2 text-sm text-slate-400">{item.description}</p><p className="mt-3 text-xs text-slate-500">{item.address}</p>
        {item.technicianName && <div><Reputation photo={item.technicianProfilePhotoUrl} name={item.technicianName} rating={item.technicianAverageRating ?? 5} services={item.technicianCompletedServicesCount} description={item.technicianExperienceDescription} /><VerificationBadges verified={item.technicianDocumentsVerified} certified={item.certifiedTechnician} /></div>}
        {item.estimatedPrice != null && <p className="mt-2 text-sm">Estimado: {formatCopCurrency(item.estimatedPrice)}</p>}
        {item.finalPrice != null && <p className="mt-2 font-bold">Precio final: {formatCopCurrency(item.finalPrice)}</p>}
        <Tracking status={item.status} />
        {item.images?.length > 0 && <ImageGallery urls={item.images.map((image) => image.imageUrl)} />}
        {item.technicianId && ['QUOTE_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(item.status) && <TechnicianLocationViewer requestId={item.id} />}
        {item.status === 'QUOTE_PENDING' && quotes.data?.[item.id]?.filter((quote) => quote.status === 'PENDING').map((quote) => <div key={quote.id} className="mt-4 rounded-xl border border-slate-700 bg-slate-950/50 p-3">
          <Reputation photo={quote.technicianProfilePhotoUrl} name={quote.technicianName} rating={quote.technicianAverageRating} services={quote.technicianCompletedServicesCount} description={quote.technicianExperienceDescription} />
          <VerificationBadges verified={quote.technicianDocumentsVerified} certified={quote.certifiedTechnician} />
          <p className="mt-2 text-lg font-bold text-brand-400">{formatCopCurrency(quote.price)}</p>
          {quote.description && <p className="text-sm text-slate-400">{quote.description}</p>}
          <div className="mt-3 flex gap-2"><button onClick={() => action.mutate(() => clientApi.confirmQuote(item.id, quote.id))} className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-slate-950">Aceptar</button><button onClick={() => action.mutate(() => clientApi.rejectQuote(item.id, quote.id))} className="rounded-lg border border-red-500 px-3 py-2 text-sm text-red-300">Rechazar</button></div>
        </div>)}
        {item.status === 'COMPLETED' && <p className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">El técnico debe confirmar si recibió el pago para cerrar el servicio. Después ambos podrán calificar o reportar un problema.</p>}
        <div className="mt-4 flex gap-2">
          {item.technicianId && <button onClick={() => setChatRequest(item)} className="rounded-lg border border-brand-500/50 px-3 py-2 text-sm text-brand-300">Abrir chat</button>}
          {!['COMPLETED', 'PAID', 'CANCELLED'].includes(item.status) && <button onClick={() => action.mutate(() => clientApi.cancel(item.id))} className="rounded-lg border border-red-500/50 px-3 py-2 text-sm text-red-300">Cancelar</button>}
        </div>
        {item.status === 'PAID' && ratingStatuses.data?.[item.id] === false && ratingRequest?.id !== item.id && <div className="mt-4 grid gap-2 rounded-xl bg-slate-950/50 p-3"><strong className="text-sm">Califica al técnico</strong><select value={ratings[item.id]?.score ?? 5} onChange={(event) => setRatings({ ...ratings, [item.id]: { score: Number(event.target.value), comment: ratings[item.id]?.comment ?? '', selectedPhrases: ratings[item.id]?.selectedPhrases ?? [] } })}>{[5, 4, 3, 2, 1].map((score) => <option key={score} value={score}>{score} estrellas</option>)}</select><RatingPhraseChips audience="CLIENT" selected={ratings[item.id]?.selectedPhrases ?? []} onChange={(selectedPhrases) => setRatings({ ...ratings, [item.id]: { score: ratings[item.id]?.score ?? 5, comment: ratings[item.id]?.comment ?? '', selectedPhrases } })} /><textarea placeholder="Comentario personal opcional" value={ratings[item.id]?.comment ?? ''} onChange={(event) => setRatings({ ...ratings, [item.id]: { score: ratings[item.id]?.score ?? 5, comment: event.target.value, selectedPhrases: ratings[item.id]?.selectedPhrases ?? [] } })} /><button onClick={() => {
          submitRating(item)
        }} className="rounded-lg border border-brand-500 px-3 py-2 text-sm text-brand-300">Enviar calificación</button></div>}
        <ServiceSupportPanel requestId={item.id} />
      </article>)}</div>
    </QueryState>
    {chatRequest && <ChatPanel request={chatRequest} currentUserId={session!.userId} onClose={() => setChatRequest(null)} />}
    {ratingRequest && <RatingDialog
      request={ratingRequest}
      draft={ratings[ratingRequest.id] ?? { score: 5, comment: '', selectedPhrases: [] }}
      loading={action.isPending}
      onDraft={(draft) => setRatings({ ...ratings, [ratingRequest.id]: draft })}
      onClose={() => setRatingRequest(null)}
      onSubmit={() => submitRating(ratingRequest, () => setRatingRequest(null))}
    />}
  </section>
}

function VerificationBadges({ verified, certified }: { verified?: boolean; certified?: boolean }) {
  if (!verified && !certified) return null
  return <div className="ml-3 mt-1 flex flex-wrap gap-2 text-sm font-bold text-brand-400">
    {verified && <span>✓ Verificado</span>}
    {certified && <span>✓ Titulado</span>}
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
  request: ServiceRequest
  draft: RatingDraft
  loading: boolean
  onDraft: (draft: RatingDraft) => void
  onClose: () => void
  onSubmit: () => void
}) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4">
    <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
      <h3 className="text-2xl font-black">Califica el servicio</h3>
      <p className="mt-2 text-slate-400">El técnico cerró el trabajo. Tu opinión ayuda a otros clientes.</p>
      <p className="mt-3 text-sm font-bold text-brand-300">{request.categoryName}</p>
      <select className="mt-5" value={draft.score} onChange={(event) => onDraft({ ...draft, score: Number(event.target.value) })}>
        {[5, 4, 3, 2, 1].map((score) => <option key={score} value={score}>{score} estrellas</option>)}
      </select>
      <div className="mt-3"><RatingPhraseChips audience="CLIENT" selected={draft.selectedPhrases ?? []} onChange={(selectedPhrases) => onDraft({ ...draft, selectedPhrases })} /></div>
      <textarea className="mt-3" placeholder="Comentario personal opcional" value={draft.comment} onChange={(event) => onDraft({ ...draft, comment: event.target.value })} />
      <div className="mt-5 grid gap-3">
        <button disabled={loading} onClick={onSubmit} className="rounded-xl bg-brand-500 px-4 py-3 font-black text-slate-950 disabled:opacity-60">Enviar calificación</button>
        <button disabled={loading} onClick={onClose} className="py-2 font-bold text-slate-400">Calificar después</button>
      </div>
    </div>
  </div>
}
