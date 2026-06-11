import { useCallback, useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { api, assetUrl } from '../lib/api'
import { useAuth } from '../context/useAuth'
import type { AdminDashboardSummary, ChatMessage, FinancialSummary, Payment, RequestStatus, ServiceCategory, ServiceQuote, ServiceRequest, TechnicianProfile, UnreadCount, UserNotification, UserProfile, UserVerification, VerificationStatus, Verifier } from '../types'
import { uploadFile } from '../lib/files'
import { usePolling } from '../lib/usePolling'

function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="mx-auto max-w-6xl px-6 py-12"><p className="text-brand-400">{subtitle}</p><h1 className="mt-1 text-4xl font-black">{title}</h1><div className="mt-8">{children}</div></section>
}

function apiMessage(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.data?.message ?? 'No fue posible completar la operación' : 'Error inesperado'
}

const statusLabels: Record<RequestStatus, string> = {
  QUOTE_PENDING: 'Esperando cotización', QUOTED: 'Cotizada', QUOTE_ACCEPTED: 'Cotización aceptada',
  ON_THE_WAY: 'En camino', ARRIVED: 'Técnico llegó', IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada', PAID: 'Pagada', CANCELLED: 'Cancelada',
}

function Status({ value }: { value: RequestStatus }) {
  return <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-bold text-brand-400">{statusLabels[value]}</span>
}

export function ClientDashboard() {
  const { session } = useAuth()
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [ratings, setRatings] = useState<Record<string, { score: number; comment: string }>>({})
  const [form, setForm] = useState({ categoryId: '', description: '', address: '', latitude: '', longitude: '', estimatedPrice: '' })
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [chatRequest, setChatRequest] = useState<ServiceRequest | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [quotes, setQuotes] = useState<Record<string, ServiceQuote[]>>({})

  const load = useCallback(async () => {
    const [catalog, mine, history] = await Promise.all([api.get<ServiceCategory[]>('/v1/services'), api.get<ServiceRequest[]>('/v1/service-requests/my'), api.get<Payment[]>('/v1/payments/mine')])
    setCategories(catalog.data); setRequests(mine.data); setPayments(history.data)
    const quoteEntries = await Promise.all(mine.data.map(async (request) => {
      const response = await api.get<ServiceQuote[]>(`/v1/service-requests/${request.id}/quotes`)
      return [request.id, response.data] as const
    }))
    setQuotes(Object.fromEntries(quoteEntries))
  }, [])
  useEffect(() => { void load() }, [load])
  usePolling(load, 10_000)

  async function submit(event: FormEvent) {
    event.preventDefault(); setError('')
    try {
      await api.post('/v1/service-requests', {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        estimatedPrice: form.estimatedPrice ? Number(form.estimatedPrice) : null,
      })
      setForm({ categoryId: '', description: '', address: '', latitude: '', longitude: '', estimatedPrice: '' })
      setNotice('Solicitud creada y disponible para técnicos cercanos.')
      await load()
    } catch (reason) { setError(apiMessage(reason)) }
  }

  async function cancel(id: string) {
    setError('')
    try {
      await api.put(`/v1/service-requests/${id}/status`, { status: 'CANCELLED' })
      await load()
    } catch (reason) { setError(apiMessage(reason)) }
  }

  async function confirmQuote(id: string, quoteId: string) {
    try { await api.put(`/v1/service-requests/${id}/confirm-quote`, { quoteId }); await load() } catch (reason) { setError(apiMessage(reason)) }
  }

  async function payCash(id: string) {
    try { await api.post(`/v1/service-requests/${id}/payment/cash`); setNotice('Pago en efectivo confirmado.'); await load() } catch (reason) { setError(apiMessage(reason)) }
  }

  async function rate(id: string) {
    try {
      await api.post(`/v1/service-requests/${id}/ratings`, ratings[id] ?? { score: 5, comment: '' })
      setNotice('Calificación enviada.')
    } catch (reason) { setError(apiMessage(reason)) }
  }

  function currentLocation() {
    navigator.geolocation.getCurrentPosition(({ coords }) => setForm({
      ...form, latitude: String(coords.latitude), longitude: String(coords.longitude),
    }), () => setError('No fue posible obtener la ubicación del navegador'))
  }

  return <Shell title={`Hola, ${session?.fullName}`} subtitle="Panel cliente"><NotificationCenter /><button onClick={() => setShowProfile((value) => !value)} className="mb-6 rounded-lg border border-brand-500 px-4 py-2 text-brand-300">{showProfile ? 'Cerrar perfil' : 'Mi perfil'}</button>{showProfile && <UserProfileEditor />}<div className="grid gap-8 lg:grid-cols-2">
    <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-bold">Crear solicitud</h2>
      <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required><option value="">Selecciona una categoría</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      <textarea placeholder="Describe lo que necesitas" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
      <input placeholder="Dirección del servicio" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
      <div className="grid grid-cols-2 gap-3"><input type="number" step="any" placeholder="Latitud" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} required /><input type="number" step="any" placeholder="Longitud" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} required /></div>
      <button type="button" onClick={currentLocation} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">Usar mi ubicación</button>
      <input type="number" min="0" step="1000" placeholder="Presupuesto estimado (opcional)" value={form.estimatedPrice} onChange={(e) => setForm({ ...form, estimatedPrice: e.target.value })} />
      {notice && <p className="text-sm text-emerald-400">{notice}</p>}{error && <p className="text-sm text-red-400">{error}</p>}
      <button className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">Crear solicitud</button>
    </form>
    <div><h2 className="mb-4 text-xl font-bold">Mis solicitudes</h2><div className="space-y-3">{requests.length === 0 && <p className="text-slate-400">Aún no tienes solicitudes.</p>}{requests.map((item) => <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex justify-between gap-4"><strong>{item.categoryName}</strong><Status value={item.status} /></div>
      <p className="mt-2 text-sm text-slate-400">{item.description}</p><p className="mt-3 text-xs text-slate-500">{item.address}</p>
      {item.technicianName && <p className="mt-2 text-sm">Técnico: {item.technicianName}</p>}
      {item.technicianName && <Reputation photo={item.technicianProfilePhotoUrl} name={item.technicianName} rating={item.technicianAverageRating ?? 5} services={item.technicianCompletedServicesCount} description={[item.technicianExperienceDescription, item.technicianCategories?.join(', ')].filter(Boolean).join(' · ')} />}
      {item.estimatedPrice != null && <p className="mt-2 text-sm">Estimado: ${item.estimatedPrice.toLocaleString()}</p>}
      {item.technicianPrice != null && <p className="mt-2 text-sm text-brand-400">Cotización aceptada: ${item.technicianPrice.toLocaleString()}</p>}
      {item.finalPrice != null && <p className="mt-2 font-bold">Precio final: ${item.finalPrice.toLocaleString()}</p>}
      <Tracking status={item.status} />
      {item.status === 'QUOTE_PENDING' && (quotes[item.id]?.length ?? 0) > 0 && <div className="mt-4 space-y-3"><strong className="text-sm">Cotizaciones recibidas</strong>{quotes[item.id].filter((quote) => quote.status === 'PENDING').map((quote) => <div key={quote.id} className="rounded-xl border border-slate-700 bg-slate-950/50 p-3"><Reputation photo={quote.technicianProfilePhotoUrl} name={quote.technicianName} rating={quote.technicianAverageRating} services={quote.technicianCompletedServicesCount} description={[quote.technicianExperienceDescription, quote.technicianCategories.join(', ')].filter(Boolean).join(' · ')} /><p className="mt-2 text-lg font-bold text-brand-400">${quote.price.toLocaleString()}</p>{quote.description && <p className="text-sm text-slate-400">{quote.description}</p>}<button onClick={() => confirmQuote(item.id, quote.id)} className="mt-3 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-slate-950">Aceptar esta cotización</button></div>)}</div>}
      <div className="mt-4 flex gap-2">
        {item.status === 'COMPLETED' && <button onClick={() => payCash(item.id)} className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-slate-950">Confirmar pago en efectivo</button>}
        {item.technicianId && <button onClick={() => setChatRequest(item)} className="rounded-lg border border-brand-500/50 px-3 py-2 text-sm text-brand-300">Abrir chat</button>}
        {!['COMPLETED', 'PAID', 'CANCELLED'].includes(item.status) && <button onClick={() => cancel(item.id)} className="rounded-lg border border-red-500/50 px-3 py-2 text-sm text-red-300">Cancelar</button>}</div>
      {item.status === 'PAID' && <div className="mt-4 grid gap-2 rounded-xl bg-slate-950/50 p-3"><strong className="text-sm">Califica al técnico</strong><select value={ratings[item.id]?.score ?? 5} onChange={(event) => setRatings({ ...ratings, [item.id]: { score: Number(event.target.value), comment: ratings[item.id]?.comment ?? '' } })}>{[5, 4, 3, 2, 1].map((score) => <option key={score} value={score}>{score} estrellas</option>)}</select><textarea placeholder="Comentario opcional" value={ratings[item.id]?.comment ?? ''} onChange={(event) => setRatings({ ...ratings, [item.id]: { score: ratings[item.id]?.score ?? 5, comment: event.target.value } })} /><button onClick={() => rate(item.id)} className="rounded-lg border border-brand-500 px-3 py-2 text-sm text-brand-300">Enviar calificación</button></div>}
    </article>)}</div></div>
  </div><FinancialList title="Historial de pagos" items={payments} amount={(item) => item.amount} empty="Aún no tienes pagos registrados." />{chatRequest && <ChatPanel request={chatRequest} currentUserId={session!.userId} onClose={() => setChatRequest(null)} />}</Shell>
}

const emptyProfile = { documentNumber: '', phone: '', categoryIds: [] as string[], description: '', profilePhotoUrl: '', documentPhotoUrl: '', certificatePhotoUrl: '', workExperienceDescription: '', latitude: '', longitude: '' }

export function TechnicianDashboard() {
  const { session } = useAuth()
  const [profile, setProfile] = useState<TechnicianProfile | null>(null)
  const [profileForm, setProfileForm] = useState(emptyProfile)
  const [available, setAvailable] = useState<ServiceRequest[]>([])
  const [assigned, setAssigned] = useState<ServiceRequest[]>([])
  const [earnings, setEarnings] = useState<FinancialSummary | null>(null)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [radiusKm, setRadiusKm] = useState('10')
  const [quotes, setQuotes] = useState<Record<string, string>>({})
  const [quoteDescriptions, setQuoteDescriptions] = useState<Record<string, string>>({})
  const [chatRequest, setChatRequest] = useState<ServiceRequest | null>(null)
  const [error, setError] = useState('')
  const [showProfile, setShowProfile] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      const catalog = await api.get<ServiceCategory[]>('/v1/service-categories')
      setCategories(catalog.data)
      const { data } = await api.get<TechnicianProfile>('/v1/technicians/me')
      setProfile(data)
      setProfileForm({ documentNumber: data.documentNumber, phone: data.phone, categoryIds: data.categories.map((item) => item.id), description: data.description, profilePhotoUrl: data.profilePhotoUrl ?? '', documentPhotoUrl: data.documentPhotoUrl ?? '', certificatePhotoUrl: data.certificatePhotoUrl ?? '', workExperienceDescription: data.workExperienceDescription, latitude: String(data.latitude ?? ''), longitude: String(data.longitude ?? '') })
      const mine = await api.get<ServiceRequest[]>('/v1/service-requests/my-assigned')
      setAssigned(mine.data)
      setEarnings((await api.get<FinancialSummary>('/v1/technicians/me/earnings')).data)
      if (data.status === 'APPROVED') setAvailable((await api.get<ServiceRequest[]>(`/v1/service-requests/available?radiusKm=${radiusKm}`)).data)
    } catch (reason) {
      if (!axios.isAxiosError(reason) || reason.response?.status !== 404) setError(apiMessage(reason))
    }
  }, [radiusKm])
  useEffect(() => { void load() }, [load])
  usePolling(load, 10_000)

  async function saveProfile(event: FormEvent) {
    event.preventDefault(); setError('')
    const payload = { ...profileForm, latitude: Number(profileForm.latitude), longitude: Number(profileForm.longitude) }
    try {
      if (profile) await api.put('/v1/technicians/me', payload)
      else await api.post('/v1/technicians/profile', payload)
      await load()
    } catch (reason) { setError(apiMessage(reason)) }
  }

  function useProfileLocation() {
    setError('')
    if (!navigator.geolocation) {
      setError('Este navegador no permite obtener la ubicación')
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setProfileForm({
        ...profileForm,
        latitude: String(coords.latitude),
        longitude: String(coords.longitude),
      }),
      () => setError('No fue posible obtener la ubicación. Revisa el permiso del navegador.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  async function quote(id: string) {
    try {
      await api.put(`/v1/service-requests/${id}/quote`, {
        technicianPrice: Number(quotes[id]),
        description: quoteDescriptions[id] || undefined,
      })
      await load()
    } catch (reason) { setError(apiMessage(reason)) }
  }

  async function sendEmailVerification() {
    try {
      await api.post('/v1/auth/resend-email-verification')
      setError('Correo de verificación enviado. Revisa tu bandeja de entrada.')
    } catch (reason) { setError(apiMessage(reason)) }
  }

  async function profileFile(field: 'profilePhotoUrl' | 'documentPhotoUrl' | 'certificatePhotoUrl', file?: File) {
    if (!file) return
    const kind = field === 'profilePhotoUrl' ? 'PROFILE' : field === 'certificatePhotoUrl' ? 'CERTIFICATE' : 'DOCUMENT'
    try { setProfileForm({ ...profileForm, [field]: await uploadFile(file, kind) }) } catch (reason) { setError(apiMessage(reason)) }
  }

  async function rateClient(item: ServiceRequest) {
    const score = Number(window.prompt('Calificación del cliente (1 a 5)', '5'))
    if (!Number.isInteger(score) || score < 1 || score > 5) return
    const comment = window.prompt('Comentario', '') ?? ''
    try { await api.post(`/v1/service-requests/${item.id}/ratings`, { score, comment }); await load() } catch (reason) { setError(apiMessage(reason)) }
  }

  async function advance(item: ServiceRequest) {
    const next: Partial<Record<RequestStatus, RequestStatus>> = { QUOTE_ACCEPTED: 'ON_THE_WAY', ON_THE_WAY: 'ARRIVED', ARRIVED: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED' }
    if (!next[item.status]) return
    try { await api.put(`/v1/service-requests/${item.id}/status`, { status: next[item.status] }); await load() } catch (reason) { setError(apiMessage(reason)) }
  }

  return <Shell title={`Hola, ${session?.fullName}`} subtitle="Panel técnico">
    <NotificationCenter />
    <div className="mb-6 flex flex-wrap gap-2"><button onClick={() => setShowProfile((value) => !value)} className="rounded-lg border border-brand-500 px-4 py-2 text-brand-300">{showProfile ? 'Cerrar perfil' : 'Mi perfil'}</button>{!session?.emailVerified && <button onClick={() => void sendEmailVerification()} className="rounded-lg border border-amber-500 px-4 py-2 text-amber-300">Reenviar verificación de correo</button>}</div>
    {error && <p className="mb-4 rounded-xl bg-red-500/10 p-3 text-red-300">{error}</p>}
    <div className={`grid gap-8 ${showProfile || !profile ? 'lg:grid-cols-2' : ''}`}>
      {(showProfile || !profile) && <form onSubmit={saveProfile} className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-6"><div className="flex justify-between"><h2 className="text-xl font-bold">Perfil técnico</h2>{profile && <StatusText value={profile.status} />}</div>
        {profile && <VerificationBadge value={profile.verificationStatus} />}
        <input placeholder="Documento" value={profileForm.documentNumber} onChange={(e) => setProfileForm({ ...profileForm, documentNumber: e.target.value })} required />
        <input placeholder="Teléfono" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} required />
        <fieldset><legend className="mb-2 text-sm text-slate-400">Categorías</legend><div className="grid gap-2 sm:grid-cols-2">{categories.map((category) => <label key={category.id} className="flex gap-2 text-sm"><input type="checkbox" checked={profileForm.categoryIds.includes(category.id)} onChange={(event) => setProfileForm({ ...profileForm, categoryIds: event.target.checked ? [...profileForm.categoryIds, category.id] : profileForm.categoryIds.filter((id) => id !== category.id) })} />{category.name}</label>)}</div></fieldset>
        <textarea placeholder="Descripción profesional" value={profileForm.description} onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })} required />
        <textarea placeholder="Experiencia laboral" value={profileForm.workExperienceDescription} onChange={(e) => setProfileForm({ ...profileForm, workExperienceDescription: e.target.value })} required />
        <label className="text-sm">Foto de perfil<input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => void profileFile('profilePhotoUrl', e.target.files?.[0])} /></label>
        <label className="text-sm">Documento obligatorio<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => void profileFile('documentPhotoUrl', e.target.files?.[0])} required={!profileForm.documentPhotoUrl} /></label>
        <label className="text-sm">Certificado opcional<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => void profileFile('certificatePhotoUrl', e.target.files?.[0])} /></label>
        <div className="grid grid-cols-2 gap-3"><input type="number" step="any" placeholder="Latitud" value={profileForm.latitude} onChange={(e) => setProfileForm({ ...profileForm, latitude: e.target.value })} required /><input type="number" step="any" placeholder="Longitud" value={profileForm.longitude} onChange={(e) => setProfileForm({ ...profileForm, longitude: e.target.value })} required /></div>
        <button type="button" onClick={useProfileLocation} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">Usar mi ubicación</button>
        <button className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">{profile ? 'Actualizar perfil' : 'Crear perfil'}</button>
      </form>}
      <RequestList title="Mis servicios" items={assigned} actionLabel={(item) => {
        const labels: Partial<Record<RequestStatus, string>> = { QUOTE_ACCEPTED: 'Ir en camino', ON_THE_WAY: 'Marcar llegada', ARRIVED: 'Iniciar servicio', IN_PROGRESS: 'Completar' }
        return item.status === 'PAID' ? 'Calificar cliente' : labels[item.status]
      }} onAction={(item) => item.status === 'PAID' ? void rateClient(item) : void advance(item)} onChat={setChatRequest} />
    </div>
    {profile?.status === 'APPROVED' && <div className="mt-8"><div className="mb-4 flex items-center gap-3"><label>Radio (km)</label><input className="max-w-28" type="number" min="1" max="100" value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} /><button onClick={() => void load()} className="rounded-lg border border-slate-700 px-3 py-2">Buscar</button></div>
      <section><h2 className="mb-4 text-xl font-bold">Solicitudes cercanas</h2><div className="space-y-3">{available.length === 0 && <p className="text-slate-400">No hay solicitudes dentro del radio.</p>}{available.map((item) => <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><strong>{item.categoryName}</strong><Reputation photo={item.clientProfilePhotoUrl} name={item.clientName} rating={item.clientAverageRating} services={item.clientPaidServicesCount} /><p className="mt-2 text-sm text-slate-400">{item.description}</p>{item.estimatedPrice != null && <p className="mt-2 font-bold text-brand-400">Estimado del cliente: ${item.estimatedPrice.toLocaleString()}</p>}<p className="mt-2 text-xs text-slate-500">{item.address} · {item.distanceKm?.toFixed(2)} km</p><div className="mt-4 grid gap-2 sm:grid-cols-[1fr_2fr_auto]"><input type="number" min="1" placeholder="Tu cotización" value={quotes[item.id] ?? ''} onChange={(e) => setQuotes({ ...quotes, [item.id]: e.target.value })} /><input placeholder="Descripción de la oferta (opcional)" value={quoteDescriptions[item.id] ?? ''} onChange={(e) => setQuoteDescriptions({ ...quoteDescriptions, [item.id]: e.target.value })} /><button disabled={!quotes[item.id]} onClick={() => quote(item.id)} className="rounded-lg bg-brand-500 px-3 py-2 font-bold text-slate-950">Cotizar</button></div></article>)}</div></section>
    </div>}
    {earnings && <div className="mt-8"><FinancialSummaryCard title="Mis ganancias" summary={earnings} /><FinancialList title="Historial de ganancias" items={earnings.payments} amount={(item) => item.technicianAmount} empty="Aún no tienes ganancias registradas." /></div>}
    {chatRequest && <ChatPanel request={chatRequest} currentUserId={session!.userId} onClose={() => setChatRequest(null)} />}
  </Shell>
}

function StatusText({ value }: { value: string }) {
  return <span className="text-sm font-bold text-brand-400">{value}</span>
}

const verificationLabels: Record<VerificationStatus, string> = {
  CREATED: 'Cuenta creada: carga tu documento',
  PENDING_VERIFICATION: 'Documento pendiente de verificación',
  VERIFIED: 'Identidad verificada',
}

function VerificationBadge({ value }: { value: VerificationStatus }) {
  const color = value === 'VERIFIED' ? 'text-emerald-400' : value === 'PENDING_VERIFICATION' ? 'text-amber-300' : 'text-slate-400'
  return <span className={`text-sm font-bold ${color}`}>{verificationLabels[value]}</span>
}

function Reputation({ photo, name, rating, services, description }: { photo?: string; name: string; rating: number; services: number; description?: string }) {
  return <div className="mt-3 flex gap-3 rounded-xl bg-slate-950/50 p-3">{photo ? <img src={assetUrl(photo)} alt="" className="h-12 w-12 rounded-full object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-800 font-bold">{name.charAt(0)}</div>}<div><strong>{name}</strong><p className="text-sm text-brand-400">★ {rating.toFixed(1)} · {services} servicios</p>{description && <p className="text-xs text-slate-500">{description}</p>}</div></div>
}

function UserProfileEditor() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { api.get<UserProfile>('/v1/users/me/profile').then(({ data }) => setProfile(data)).catch((reason) => setError(apiMessage(reason))) }, [])
  async function file(field: 'profilePhotoUrl' | 'documentPhotoUrl', selected?: File) {
    if (!selected || !profile) return
    try { setProfile({ ...profile, [field]: await uploadFile(selected, field === 'profilePhotoUrl' ? 'PROFILE' : 'DOCUMENT') }) } catch (reason) { setError(apiMessage(reason)) }
  }
  async function save(event: FormEvent) {
    event.preventDefault()
    if (!profile) return
    try { setProfile((await api.put<UserProfile>('/v1/users/me/profile', profile)).data) } catch (reason) { setError(apiMessage(reason)) }
  }
  async function sendEmailVerification() {
    try {
      await api.post('/v1/auth/send-email-verification')
      setError('Correo de verificación enviado. Revisa tu bandeja de entrada.')
    } catch (reason) { setError(apiMessage(reason)) }
  }
  if (!profile) return null
  return <form onSubmit={save} className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">Mi perfil y reputación</h2><span className="text-brand-400">★ {profile.averageRating.toFixed(1)} · {profile.paidServicesCount} pagados</span></div><div className="mt-2"><VerificationBadge value={profile.verificationStatus} /><p className="mt-1 text-sm text-slate-400">Correo: {profile.emailVerified ? 'verificado' : 'pendiente'} · Documentos: {profile.documentsVerified ? 'verificados' : 'pendientes'}</p></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><input value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} required /><input placeholder="Teléfono" value={profile.phone ?? ''} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /><label className="text-sm">Foto de perfil<input type="file" accept=".jpg,.jpeg,.png" onChange={(event) => void file('profilePhotoUrl', event.target.files?.[0])} /></label><label className="text-sm">Documento de identidad<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => void file('documentPhotoUrl', event.target.files?.[0])} /></label></div>{error && <p className="mt-2 text-sm text-slate-300">{error}</p>}<div className="mt-3 flex flex-wrap gap-2"><button className="rounded-lg border border-brand-500 px-3 py-2 text-sm text-brand-300">Guardar perfil</button>{!profile.emailVerified && <button type="button" onClick={() => void sendEmailVerification()} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Verificar correo</button>}</div></form>
}

function RequestList({ title, items, actionLabel, onAction, onChat }: { title: string; items: ServiceRequest[]; actionLabel: (item: ServiceRequest) => string | undefined; onAction: (item: ServiceRequest) => void; onChat?: (item: ServiceRequest) => void }) {
  return <section><h2 className="mb-4 text-xl font-bold">{title}</h2><div className="space-y-3">{items.length === 0 && <p className="text-slate-400">No hay solicitudes.</p>}{items.map((item) => <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="flex justify-between"><strong>{item.categoryName}</strong><Status value={item.status} /></div><p className="mt-2 text-sm text-slate-400">{item.description}</p><p className="mt-2 text-xs text-slate-500">{item.address}</p>{item.finalPrice != null && <p className="mt-2 font-bold">${item.finalPrice.toLocaleString()}</p>}<Tracking status={item.status} /><div className="mt-4 flex gap-2">{actionLabel(item) && <button onClick={() => onAction(item)} className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-bold text-slate-950">{actionLabel(item)}</button>}{onChat && item.technicianId && <button onClick={() => onChat(item)} className="rounded-lg border border-brand-500/50 px-3 py-2 text-sm text-brand-300">Chat</button>}</div></article>)}</div></section>
}

const trackingSteps: RequestStatus[] = ['QUOTE_PENDING', 'QUOTED', 'QUOTE_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'PAID']

function Tracking({ status }: { status: RequestStatus }) {
  if (status === 'CANCELLED') return <p className="mt-3 text-sm text-red-300">Servicio cancelado</p>
  const current = trackingSteps.indexOf(status)
  return <div className="mt-4 flex gap-1">{trackingSteps.map((step, index) => <span key={step} title={statusLabels[step]} className={`h-2 flex-1 rounded ${index <= current ? 'bg-brand-500' : 'bg-slate-700'}`} />)}</div>
}

function NotificationCenter() {
  const [items, setItems] = useState<UserNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const load = useCallback(async () => {
    const [notifications, count] = await Promise.all([
      api.get<UserNotification[]>('/v1/notifications'),
      api.get<UnreadCount>('/v1/notifications/unread-count'),
    ])
    setItems(notifications.data)
    setUnread(count.data.count)
  }, [])
  useEffect(() => { void load() }, [load])
  usePolling(load, 10_000)
  async function read(item: UserNotification) { if (!item.read) await api.put(`/v1/notifications/${item.id}/read`); await load() }
  return <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="flex justify-between"><button onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 font-bold"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg> Notificaciones {unread > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{unread}</span>}</button><button onClick={() => void load()} className="text-sm text-brand-400">Actualizar</button></div>{open && <div className="mt-3 space-y-2">{items.length === 0 && <p className="text-sm text-slate-500">Sin notificaciones.</p>}{items.slice(0, 10).map((item) => <button key={item.id} onClick={() => void read(item)} className={`block w-full rounded-xl p-3 text-left ${item.read ? 'bg-slate-950/40 text-slate-500' : 'bg-brand-500/10 text-slate-200'}`}><strong className="text-sm">{item.title}</strong><p className="text-xs">{item.message}</p><time className="mt-1 block text-[11px] text-slate-500">{new Date(item.createdAt).toLocaleString()}</time></button>)}</div>}</section>
}

function ChatPanel({ request, currentUserId, onClose }: { request: ServiceRequest; currentUserId: string; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const load = useCallback(async () => {
    const { data } = await api.get<ChatMessage[]>(`/v1/service-requests/${request.id}/chat`)
    setMessages(data)
    await api.put(`/v1/service-requests/${request.id}/chat/read`)
  }, [request.id])
  useEffect(() => { void load() }, [load])
  usePolling(load, 5_000)
  async function send(event: FormEvent) { event.preventDefault(); if (!text.trim()) return; await api.post(`/v1/service-requests/${request.id}/chat/messages`, { message: text }); setText(''); await load() }
  return <section className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4"><div className="w-full max-w-xl rounded-3xl border border-slate-700 bg-slate-900 p-6"><div className="flex justify-between"><h2 className="text-xl font-bold">Chat · {request.categoryName}</h2><button onClick={onClose}>Cerrar</button></div><div className="my-4 max-h-80 space-y-2 overflow-y-auto">{messages.length === 0 && <p className="text-slate-500">Inicia la conversación.</p>}{messages.map((item) => <div key={item.id} className={`max-w-[80%] rounded-xl p-3 ${item.senderId === currentUserId ? 'ml-auto bg-brand-500 text-slate-950' : 'bg-slate-800'}`}><p className="text-xs font-bold">{item.senderName}</p><p>{item.message}</p></div>)}</div><form onSubmit={send} className="flex gap-2"><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje" /><button className="rounded-xl bg-brand-500 px-4 font-bold text-slate-950">Enviar</button></form></div></section>
}

function VerificationQueue() {
  const [items, setItems] = useState<UserVerification[]>([])
  const [error, setError] = useState('')
  const load = useCallback(() => api.get<UserVerification[]>('/v1/verifications/pending')
    .then(({ data }) => setItems(data))
    .catch((reason) => setError(apiMessage(reason))), [])
  useEffect(() => { void load() }, [load])

  async function verify(id: string) {
    try { await api.put(`/v1/verifications/${id}/verify`); await load() } catch (reason) { setError(apiMessage(reason)) }
  }
  async function reject(id: string) {
    try { await api.put(`/v1/admin/users/${id}/reject-documents`); await load() } catch (reason) { setError(apiMessage(reason)) }
  }

  async function openEvidence(url?: string) {
    if (!url) return
    try {
      const response = await api.get(url, { responseType: 'blob' })
      window.open(URL.createObjectURL(response.data), '_blank', 'noopener,noreferrer')
    } catch (reason) { setError(apiMessage(reason)) }
  }

  return <section className="mb-8"><h2 className="mb-4 text-xl font-bold">Identidades pendientes ({items.length})</h2>
    {error && <p className="mb-3 text-red-400">{error}</p>}
    <div className="grid gap-4 md:grid-cols-2">{items.length === 0 && <p className="text-slate-400">No hay documentos pendientes de verificación.</p>}
      {items.map((item) => <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{item.fullName}</h3><p className="text-sm text-slate-400">{item.email}</p></div><span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">{item.role}</span></div>
        {item.workExperienceDescription && <p className="mt-3 text-sm text-slate-400">{item.workExperienceDescription}</p>}
        <div className="mt-4 flex gap-2"><button onClick={() => void openEvidence(item.documentPhotoUrl)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Ver documento</button>{item.certificatePhotoUrl && <button onClick={() => void openEvidence(item.certificatePhotoUrl)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Ver certificado</button>}</div>
        <div className="mt-4 flex gap-2"><button onClick={() => void verify(item.id)} className="rounded-lg bg-emerald-500 px-4 py-2 font-bold text-slate-950">Marcar verificado</button><button onClick={() => void reject(item.id)} className="rounded-lg border border-red-500 px-4 py-2 text-red-300">Rechazar</button></div>
      </article>)}
    </div>
  </section>
}

function VerifierManager() {
  const [items, setItems] = useState<Verifier[]>([])
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const load = useCallback(() => api.get<Verifier[]>('/v1/admin/verifiers').then(({ data }) => setItems(data)), [])
  useEffect(() => { void load() }, [load])

  async function create(event: FormEvent) {
    event.preventDefault(); setError('')
    try {
      await api.post('/v1/admin/verifiers', form)
      setForm({ fullName: '', email: '', password: '' })
      await load()
    } catch (reason) { setError(apiMessage(reason)) }
  }

  return <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5"><h2 className="text-xl font-bold">Verificadores</h2><p className="mt-1 text-sm text-slate-400">Estas cuentas solo pueden ser creadas por un administrador.</p>
    <form onSubmit={create} className="mt-4 grid gap-3 md:grid-cols-4"><input placeholder="Nombre completo" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required /><input type="email" placeholder="Correo" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /><input type="password" minLength={8} placeholder="Contraseña temporal" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /><button className="rounded-lg bg-brand-500 px-4 py-2 font-bold text-slate-950">Crear verificador</button></form>
    {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    <div className="mt-4 flex flex-wrap gap-2">{items.map((item) => <span key={item.id} className="rounded-full border border-slate-700 px-3 py-2 text-sm">{item.fullName} · {item.email}</span>)}</div>
  </section>
}

export function VerifierDashboard() {
  return <Shell title="Verificación de identidad" subtitle="Panel verificador"><NotificationCenter /><VerificationQueue /></Shell>
}

export function AdminDashboard() {
  const [pending, setPending] = useState<TechnicianProfile[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [finances, setFinances] = useState<FinancialSummary | null>(null)
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null)
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', active: true })
  const [error, setError] = useState('')
  const load = useCallback(async () => { try { const [profiles, catalog, payments, dashboard] = await Promise.all([api.get<TechnicianProfile[]>('/v1/admin/technicians/pending'), api.get<ServiceCategory[]>('/v1/admin/service-categories'), api.get<FinancialSummary>('/v1/admin/payments'), api.get<AdminDashboardSummary>('/v1/admin/dashboard')]); setPending(profiles.data); setCategories(catalog.data); setFinances(payments.data); setSummary(dashboard.data) } catch (reason) { setError(apiMessage(reason)) } }, [])
  useEffect(() => { void load() }, [load])
  usePolling(load, 10_000)
  async function review(id: string, decision: 'approve' | 'reject') {
    try { await api.put(`/v1/admin/technicians/${id}/${decision}`); await load() } catch (reason) { setError(apiMessage(reason)) }
  }
  async function createCategory(event: FormEvent) { event.preventDefault(); try { await api.post('/v1/admin/service-categories', categoryForm); setCategoryForm({ name: '', description: '', active: true }); await load() } catch (reason) { setError(apiMessage(reason)) } }
  async function toggleCategory(category: ServiceCategory) { try { await api.put(`/v1/admin/service-categories/${category.id}`, { name: category.name, description: category.description, active: !category.active }); await load() } catch (reason) { setError(apiMessage(reason)) } }
  async function editCategory(category: ServiceCategory) {
    const name = window.prompt('Nombre de la categoría', category.name)
    if (!name) return
    const description = window.prompt('Descripción', category.description) ?? category.description
    try { await api.put(`/v1/admin/service-categories/${category.id}`, { name, description, active: category.active }); await load() } catch (reason) { setError(apiMessage(reason)) }
  }
  async function deleteCategory(category: ServiceCategory) {
    if (!window.confirm(`¿Desactivar ${category.name}?`)) return
    try { await api.delete(`/v1/admin/service-categories/${category.id}`); await load() } catch (reason) { setError(apiMessage(reason)) }
  }
  async function openEvidence(url?: string) {
    if (!url) return
    try {
      const response = await api.get(url, { responseType: 'blob' })
      window.open(URL.createObjectURL(response.data), '_blank', 'noopener,noreferrer')
    } catch (reason) { setError(apiMessage(reason)) }
  }
  return <Shell title="Centro de operaciones" subtitle="Panel administrador"><NotificationCenter />{summary && <section className="mb-6 grid gap-3 sm:grid-cols-4"><Metric label="Usuarios" value={String(summary.users)} /><Metric label="Técnicos pendientes" value={String(summary.pendingTechnicians)} /><Metric label="Identidades pendientes" value={String(summary.pendingVerifications)} /><Metric label="Pagos" value={String(summary.payments)} /></section>}{error && <p className="mb-4 text-red-400">{error}</p>}<VerifierManager /><VerificationQueue />{finances && <><FinancialSummaryCard title="Pagos y comisiones" summary={finances} /><FinancialList title="Movimientos de la plataforma" items={finances.payments} amount={(item) => item.platformFee} empty="Aún no hay pagos registrados." /></>}<div className="mt-8 grid gap-8 lg:grid-cols-2"><section><h2 className="mb-4 text-xl font-bold">Técnicos pendientes ({pending.length})</h2><div className="space-y-4">{pending.length === 0 && <p className="text-slate-400">No hay perfiles pendientes.</p>}{pending.map((profile) => <article key={profile.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h3 className="text-lg font-bold">{profile.fullName}</h3><p className="text-brand-400">{profile.categories.map((item) => item.name).join(', ')}</p><VerificationBadge value={profile.verificationStatus} /><p className="mt-3 text-sm text-slate-400">{profile.workExperienceDescription}</p><div className="mt-3 flex gap-2"><button onClick={() => openEvidence(profile.documentPhotoUrl)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Ver documento</button>{profile.certificatePhotoUrl && <button onClick={() => openEvidence(profile.certificatePhotoUrl)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Ver certificado</button>}</div><div className="mt-5 flex gap-3"><button disabled={profile.verificationStatus !== 'VERIFIED'} onClick={() => review(profile.id, 'approve')} className="rounded-lg bg-emerald-500 px-4 py-2 font-bold text-slate-950 disabled:opacity-40">Aprobar</button><button onClick={() => review(profile.id, 'reject')} className="rounded-lg border border-red-500 px-4 py-2 text-red-300">Rechazar</button></div></article>)}</div></section>
    <section><h2 className="mb-4 text-xl font-bold">Categorías</h2><form onSubmit={createCategory} className="mb-4 space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-5"><input placeholder="Nombre" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required /><input placeholder="Descripción" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} /><button className="rounded-lg bg-brand-500 px-4 py-2 font-bold text-slate-950">Crear</button></form><div className="space-y-2">{categories.map((category) => <div key={category.id} className="rounded-xl border border-slate-800 p-4"><div className="flex items-center justify-between"><div><strong>{category.name}</strong><p className="text-xs text-slate-500">{category.active ? 'Activa' : 'Inactiva'}</p></div><div className="flex gap-2"><button onClick={() => editCategory(category)} className="rounded-lg border border-slate-700 px-3 py-2">Editar</button><button onClick={() => toggleCategory(category)} className="rounded-lg border border-slate-700 px-3 py-2">{category.active ? 'Desactivar' : 'Activar'}</button><button onClick={() => deleteCategory(category)} className="rounded-lg border border-red-500/50 px-3 py-2 text-red-300">Eliminar</button></div></div></div>)}</div></section></div></Shell>
}

function FinancialSummaryCard({ title, summary }: { title: string; summary: FinancialSummary }) {
  return <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5"><h2 className="text-xl font-bold">{title}</h2><div className="mt-4 grid gap-3 sm:grid-cols-4"><Metric label="Pagos" value={String(summary.paymentCount)} /><Metric label="Total cobrado" value={`$${summary.totalAmount.toLocaleString()}`} /><Metric label="Comisión" value={`$${summary.totalPlatformFee.toLocaleString()}`} /><Metric label="Para técnicos" value={`$${summary.totalTechnicianAmount.toLocaleString()}`} /></div></section>
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-950/60 p-3"><p className="text-xs text-slate-500">{label}</p><strong>{value}</strong></div>
}

function FinancialList({ title, items, amount, empty }: { title: string; items: Payment[]; amount: (item: Payment) => number; empty: string }) {
  return <section className="mt-6"><h2 className="mb-3 text-xl font-bold">{title}</h2>{items.length === 0 ? <p className="text-slate-400">{empty}</p> : <div className="space-y-2">{items.map((item) => <article key={item.paymentId} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4"><div><strong>{item.paymentMethod === 'CASH' ? 'Efectivo' : item.paymentMethod}</strong><p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p></div><strong className="text-brand-400">${amount(item).toLocaleString()}</strong></article>)}</div>}</section>
}
