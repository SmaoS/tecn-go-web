import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/useAuth'
import { queryKeys } from '../../lib/queryClient'
import type { ServiceRequest } from '../../types'
import { ChatPanel } from '../chat/ChatPanel'
import { NotificationCenter } from '../notifications/NotificationCenter'
import { FinancialList } from '../payments/components'
import { UserProfileEditor } from '../profile/components'
import { DashboardShell } from '../shared/components/DashboardShell'
import { apiMessage } from '../shared/api'
import { ImageGallery, Reputation, Status, Tracking } from '../service-requests/components'
import { clientApi } from './api'
import { TechnicianLocationViewer } from '../technician-location/TechnicianLocationViewer'
import { useClientDashboardData } from './hooks'
import type { ClientRequestForm, RatingDraft } from './types'

const emptyRequestForm: ClientRequestForm = {
  categoryId: '', description: '', address: '', latitude: '', longitude: '', estimatedPrice: '',
}

export function ClientDashboard() {
  const { session } = useAuth()
  const client = useQueryClient()
  const [form, setForm] = useState<ClientRequestForm>(emptyRequestForm)
  const [ratings, setRatings] = useState<Record<string, RatingDraft>>({})
  const [serviceImages, setServiceImages] = useState<File[]>([])
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [chatRequest, setChatRequest] = useState<ServiceRequest | null>(null)
  const [showProfile, setShowProfile] = useState(false)

  const { categories, requests, payments, quotes } = useClientDashboardData()

  const refresh = () => Promise.all([
    client.invalidateQueries({ queryKey: queryKeys.clientRequests }),
    client.invalidateQueries({ queryKey: queryKeys.payments }),
    client.invalidateQueries({ queryKey: ['service-quotes'] }),
  ])
  const action = useMutation({
    mutationFn: async (run: () => Promise<unknown>) => run(),
    onSuccess: refresh,
    onError: (reason) => setError(apiMessage(reason)),
  })
  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    action.mutate(async () => {
      const created = await clientApi.createRequest({
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        estimatedPrice: form.estimatedPrice ? Number(form.estimatedPrice) : null,
      })
      for (const image of serviceImages) await clientApi.uploadImage(created.id, image)
      setForm(emptyRequestForm)
      setServiceImages([])
      setNotice('Solicitud creada y disponible para técnicos cercanos.')
    })
  }
  function currentLocation() {
    navigator.geolocation.getCurrentPosition(({ coords }) => setForm((value) => ({
      ...value, latitude: String(coords.latitude), longitude: String(coords.longitude),
    })), () => setError('No fue posible obtener la ubicación del navegador'))
  }

  return <DashboardShell title={`Hola, ${session?.fullName}`} subtitle="Panel cliente">
    <NotificationCenter />
    <button onClick={() => setShowProfile((value) => !value)} className="mb-6 rounded-lg border border-brand-500 px-4 py-2 text-brand-300">{showProfile ? 'Cerrar perfil' : 'Mi perfil'}</button>
    {showProfile && <UserProfileEditor />}
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold">Crear solicitud</h2>
        <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} required>
          <option value="">Selecciona una categoría</option>
          {categories.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <textarea placeholder="Describe lo que necesitas" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
        <input placeholder="Dirección del servicio" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required />
        <div className="grid grid-cols-2 gap-3"><input type="number" step="any" placeholder="Latitud" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} required /><input type="number" step="any" placeholder="Longitud" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} required /></div>
        <button type="button" onClick={currentLocation} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">Usar mi ubicación</button>
        <input type="number" min="0" step="1000" placeholder="Presupuesto estimado (opcional)" value={form.estimatedPrice} onChange={(event) => setForm({ ...form, estimatedPrice: event.target.value })} />
        <label className="block text-sm text-slate-300">Imágenes del problema (opcional, máximo 5)<input type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={(event) => setServiceImages(Array.from(event.target.files ?? []).slice(0, 5))} /></label>
        {serviceImages.length > 0 && <div className="grid grid-cols-3 gap-2">{serviceImages.map((file) => <img key={`${file.name}-${file.lastModified}`} src={URL.createObjectURL(file)} alt="" className="h-24 w-full rounded-lg object-cover" />)}</div>}
        {notice && <p className="text-sm text-emerald-400">{notice}</p>}{error && <p className="text-sm text-red-400">{error}</p>}
        <button className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">Crear solicitud</button>
      </form>
      <div><h2 className="mb-4 text-xl font-bold">Mis solicitudes</h2><div className="space-y-3">
        {(requests.data?.length ?? 0) === 0 && <p className="text-slate-400">Aún no tienes solicitudes.</p>}
        {requests.data?.map((item) => <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
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
        </article>)}
      </div></div>
    </div>
    <FinancialList title="Historial de pagos" items={payments.data ?? []} amount={(item) => item.amount} empty="Aún no tienes pagos registrados." />
    {chatRequest && <ChatPanel request={chatRequest} currentUserId={session!.userId} onClose={() => setChatRequest(null)} />}
  </DashboardShell>
}
