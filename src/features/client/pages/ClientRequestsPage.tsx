import { useState } from 'react'
import { useAuth } from '../../../context/useAuth'
import type { ServiceRequest } from '../../../types'
import { ChatPanel } from '../../chat/ChatPanel'
import { ImageGallery, Reputation, Status, Tracking } from '../../service-requests/components'
import { QueryState } from '../../shared/components/QueryState'
import { TechnicianLocationViewer } from '../../technician-location/TechnicianLocationViewer'
import { ServiceSupportPanel } from '../../service-support/ServiceSupportPanel'
import { clientApi } from '../api'
import { useClientQuotes, useClientRequestAction, useClientRequests } from '../hooks'
import type { RatingDraft } from '../types'

export function ClientRequestsPage() {
  const { session } = useAuth()
  const [ratings, setRatings] = useState<Record<string, RatingDraft>>({})
  const [chatRequest, setChatRequest] = useState<ServiceRequest | null>(null)
  const [notice, setNotice] = useState('')
  const requests = useClientRequests()
  const quotes = useClientQuotes(requests.data?.map((item) => item.id) ?? [])
  const action = useClientRequestAction()

  return <section><h2 className="mb-4 text-2xl font-bold">Mis solicitudes</h2>
    {notice && <p className="mb-4 text-sm text-emerald-400">{notice}</p>}
    {action.error && <p className="mb-4 text-sm text-red-400">No fue posible completar la operación.</p>}
    <QueryState pending={requests.isPending || quotes.isPending} error={requests.error ?? quotes.error} empty={requests.data?.length === 0}>
      <div className="space-y-3">{requests.data?.map((item) => <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex justify-between gap-4"><strong>{item.categoryName}</strong><Status value={item.status} /></div>
        <p className="mt-2 text-sm text-slate-400">{item.description}</p><p className="mt-3 text-xs text-slate-500">{item.address}</p>
        {item.technicianName && <Reputation photo={item.technicianProfilePhotoUrl} name={item.technicianName} rating={item.technicianAverageRating ?? 5} services={item.technicianCompletedServicesCount} description={[item.technicianExperienceDescription, item.technicianCategories?.join(', ')].filter(Boolean).join(' · ')} />}
        {item.estimatedPrice != null && <p className="mt-2 text-sm">Estimado: ${item.estimatedPrice.toLocaleString()}</p>}
        {item.finalPrice != null && <p className="mt-2 font-bold">Precio final: ${item.finalPrice.toLocaleString()}</p>}
        <Tracking status={item.status} />
        {item.images?.length > 0 && <ImageGallery urls={item.images.map((image) => image.imageUrl)} />}
        {item.technicianId && ['QUOTE_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(item.status) && <TechnicianLocationViewer requestId={item.id} />}
        {item.status === 'QUOTE_PENDING' && quotes.data?.[item.id]?.filter((quote) => quote.status === 'PENDING').map((quote) => <div key={quote.id} className="mt-4 rounded-xl border border-slate-700 bg-slate-950/50 p-3">
          <Reputation photo={quote.technicianProfilePhotoUrl} name={quote.technicianName} rating={quote.technicianAverageRating} services={quote.technicianCompletedServicesCount} description={[quote.technicianExperienceDescription, quote.technicianCategories.join(', ')].filter(Boolean).join(' · ')} />
          <p className="mt-2 text-lg font-bold text-brand-400">${quote.price.toLocaleString()}</p><p className="text-xs text-slate-500">Expira: {new Date(quote.expiresAt).toLocaleString()}</p>
          {quote.description && <p className="text-sm text-slate-400">{quote.description}</p>}
          <div className="mt-3 flex gap-2"><button onClick={() => action.mutate(() => clientApi.confirmQuote(item.id, quote.id))} className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-slate-950">Aceptar</button><button onClick={() => action.mutate(() => clientApi.rejectQuote(item.id, quote.id))} className="rounded-lg border border-red-500 px-3 py-2 text-sm text-red-300">Rechazar</button></div>
        </div>)}
        <div className="mt-4 flex gap-2">
          {item.status === 'COMPLETED' && <button onClick={() => action.mutate(() => clientApi.payCash(item.id), { onSuccess: () => setNotice('Pago en efectivo registrado.') })} className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-slate-950">Confirmar pago en efectivo</button>}
          {item.technicianId && <button onClick={() => setChatRequest(item)} className="rounded-lg border border-brand-500/50 px-3 py-2 text-sm text-brand-300">Abrir chat</button>}
          {!['COMPLETED', 'PAID', 'CANCELLED'].includes(item.status) && <button onClick={() => action.mutate(() => clientApi.cancel(item.id))} className="rounded-lg border border-red-500/50 px-3 py-2 text-sm text-red-300">Cancelar</button>}
        </div>
        {item.status === 'PAID' && <div className="mt-4 grid gap-2 rounded-xl bg-slate-950/50 p-3"><strong className="text-sm">Califica al técnico</strong><select value={ratings[item.id]?.score ?? 5} onChange={(event) => setRatings({ ...ratings, [item.id]: { score: Number(event.target.value), comment: ratings[item.id]?.comment ?? '' } })}>{[5, 4, 3, 2, 1].map((score) => <option key={score} value={score}>{score} estrellas</option>)}</select><textarea placeholder="Comentario opcional" value={ratings[item.id]?.comment ?? ''} onChange={(event) => setRatings({ ...ratings, [item.id]: { score: ratings[item.id]?.score ?? 5, comment: event.target.value } })} /><button onClick={() => action.mutate(() => clientApi.rate(item.id, ratings[item.id] ?? { score: 5, comment: '' }), { onSuccess: () => setNotice('Calificación enviada.') })} className="rounded-lg border border-brand-500 px-3 py-2 text-sm text-brand-300">Enviar calificación</button></div>}
        <ServiceSupportPanel requestId={item.id} />
      </article>)}</div>
    </QueryState>
    {chatRequest && <ChatPanel request={chatRequest} currentUserId={session!.userId} onClose={() => setChatRequest(null)} />}
  </section>
}
