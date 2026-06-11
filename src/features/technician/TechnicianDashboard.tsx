import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../context/useAuth'
import { queryKeys } from '../../lib/queryClient'
import { uploadFile } from '../../lib/files'
import type { RequestStatus, ServiceRequest } from '../../types'
import { ChatPanel } from '../chat/ChatPanel'
import { NotificationCenter } from '../notifications/NotificationCenter'
import { FinancialList, FinancialSummaryCard } from '../payments/components'
import { VerificationBadge } from '../profile/components'
import { DashboardShell } from '../shared/components/DashboardShell'
import { apiMessage } from '../shared/api'
import { ImageGallery, Reputation, RequestList } from '../service-requests/components'
import { technicianApi } from './api'
import { useTechnicianDashboardData } from './hooks'
import type { TechnicianProfileForm } from './types'

const emptyProfile: TechnicianProfileForm = {
  documentNumber: '', phone: '', categoryIds: [] as string[], description: '',
  profilePhotoUrl: '', documentPhotoUrl: '', certificatePhotoUrl: '',
  workExperienceDescription: '', latitude: '', longitude: '', homeAddress: '',
  homeLatitude: '', homeLongitude: '', homeCity: '', homeNeighborhood: '',
}

export function TechnicianDashboard() {
  const { session } = useAuth()
  const client = useQueryClient()
  const [profileForm, setProfileForm] = useState(emptyProfile)
  const [radiusKm, setRadiusKm] = useState('10')
  const [quotes, setQuotes] = useState<Record<string, string>>({})
  const [quoteDescriptions, setQuoteDescriptions] = useState<Record<string, string>>({})
  const [chatRequest, setChatRequest] = useState<ServiceRequest | null>(null)
  const [error, setError] = useState('')
  const [showProfile, setShowProfile] = useState(false)
  const [locationOnline, setLocationOnline] = useState(false)

  const { categories, profile, assigned, earnings, available } = useTechnicianDashboardData(radiusKm)

  useEffect(() => {
    if (!profile.data) return
    const data = profile.data
    setProfileForm({
      documentNumber: data.documentNumber, phone: data.phone,
      categoryIds: data.categories.map((item) => item.id), description: data.description,
      profilePhotoUrl: data.profilePhotoUrl ?? '', documentPhotoUrl: data.documentPhotoUrl ?? '',
      certificatePhotoUrl: data.certificatePhotoUrl ?? '',
      workExperienceDescription: data.workExperienceDescription,
      latitude: String(data.latitude ?? ''), longitude: String(data.longitude ?? ''),
      homeAddress: data.homeAddress ?? '', homeLatitude: String(data.homeLatitude ?? ''),
      homeLongitude: String(data.homeLongitude ?? ''), homeCity: data.homeCity ?? '',
      homeNeighborhood: data.homeNeighborhood ?? '',
    })
  }, [profile.data])

  const refresh = () => Promise.all([
    client.invalidateQueries({ queryKey: queryKeys.technicianProfile }),
    client.invalidateQueries({ queryKey: queryKeys.technicianRequests }),
    client.invalidateQueries({ queryKey: ['service-requests', 'available'] }),
    client.invalidateQueries({ queryKey: queryKeys.earnings }),
  ])
  const action = useMutation({
    mutationFn: (run: () => Promise<unknown>) => run(),
    onSuccess: refresh,
    onError: (reason) => setError(apiMessage(reason)),
  })
  const verifyEmail = useMutation({
    mutationFn: technicianApi.sendEmailVerification,
    onSuccess: () => setError('Correo de verificación enviado.'),
    onError: (reason) => setError(apiMessage(reason)),
  })
  function saveProfile(event: FormEvent) {
    event.preventDefault()
    action.mutate(() => technicianApi.saveProfile(profile.data ?? null, {
      ...profileForm,
      latitude: Number(profileForm.latitude),
      longitude: Number(profileForm.longitude),
      homeLatitude: Number(profileForm.homeLatitude),
      homeLongitude: Number(profileForm.homeLongitude),
    }))
  }
  function useProfileLocation() {
    navigator.geolocation.getCurrentPosition(({ coords }) => setProfileForm((value) => ({
      ...value,
      latitude: String(coords.latitude), longitude: String(coords.longitude),
      homeLatitude: String(coords.latitude), homeLongitude: String(coords.longitude),
    })), () => setError('No fue posible obtener la ubicación. Revisa el permiso del navegador.'), {
      enableHighAccuracy: true, timeout: 10_000,
    })
  }
  async function profileFile(field: 'profilePhotoUrl' | 'documentPhotoUrl' | 'certificatePhotoUrl', file?: File) {
    if (!file) return
    const kind = field === 'profilePhotoUrl' ? 'PROFILE' : field === 'certificatePhotoUrl' ? 'CERTIFICATE' : 'DOCUMENT'
    try { setProfileForm({ ...profileForm, [field]: await uploadFile(file, kind) }) } catch (reason) { setError(apiMessage(reason)) }
  }
  function quote(id: string) {
    action.mutate(
      () => technicianApi.quote(id, Number(quotes[id]), quoteDescriptions[id] || undefined),
      { onError: (reason) => setError(axios.isAxiosError(reason) && reason.response?.status === 409
        ? 'Ya tienes una cotización pendiente para este servicio. Espera a que el cliente responda o expire.'
        : apiMessage(reason)) },
    )
  }
  function advance(item: ServiceRequest) {
    const next: Partial<Record<RequestStatus, RequestStatus>> = {
      QUOTE_ACCEPTED: 'ON_THE_WAY', ON_THE_WAY: 'ARRIVED',
      ARRIVED: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED',
    }
    if (next[item.status]) action.mutate(() => technicianApi.advance(item.id, next[item.status]!))
  }
  function rateClient(item: ServiceRequest) {
    const score = Number(window.prompt('Calificación del cliente (1 a 5)', '5'))
    if (!Number.isInteger(score) || score < 1 || score > 5) return
    action.mutate(() => technicianApi.rate(item.id, score, window.prompt('Comentario', '') ?? ''))
  }

  useEffect(() => {
    if (!locationOnline || !navigator.geolocation) return
    let active = true
    const send = () => navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (active) void technicianApi.location({
        latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy,
        speed: coords.speed, heading: coords.heading, online: true,
      })
    }, () => setError('No fue posible actualizar la ubicación GPS'), {
      enableHighAccuracy: true, timeout: 10_000,
    })
    send()
    const interval = window.setInterval(send, 10_000)
    return () => { active = false; window.clearInterval(interval) }
  }, [locationOnline])
  function stopLocation() {
    setLocationOnline(false)
    action.mutate(() => technicianApi.location({
      latitude: Number(profileForm.latitude), longitude: Number(profileForm.longitude), online: false,
    }))
  }

  return <DashboardShell title={`Hola, ${session?.fullName}`} subtitle="Panel técnico">
    <NotificationCenter />
    <div className="mb-6 flex flex-wrap gap-2">
      <button onClick={() => setShowProfile((value) => !value)} className="rounded-lg border border-brand-500 px-4 py-2 text-brand-300">{showProfile ? 'Cerrar perfil' : 'Mi perfil'}</button>
      {!session?.emailVerified && <button onClick={() => verifyEmail.mutate()} className="rounded-lg border border-slate-700 px-4 py-2">Verificar correo</button>}
      {profile.data?.status === 'APPROVED' && <button onClick={() => locationOnline ? stopLocation() : setLocationOnline(true)} className={`rounded-lg px-4 py-2 font-bold ${locationOnline ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700'}`}>{locationOnline ? 'Ubicación activa · Desactivar' : 'Activar ubicación'}</button>}
    </div>
    {error && <p className="mb-4 rounded-xl bg-red-500/10 p-3 text-red-300">{error}</p>}
    <div className={`grid gap-8 ${showProfile || !profile.data ? 'lg:grid-cols-2' : ''}`}>
      {(showProfile || !profile.data) && <form onSubmit={saveProfile} className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex justify-between"><h2 className="text-xl font-bold">Perfil técnico</h2>{profile.data && <span className="text-sm font-bold text-brand-400">{profile.data.status}</span>}</div>
        {profile.data && <VerificationBadge value={profile.data.verificationStatus} />}
        <input placeholder="Documento" value={profileForm.documentNumber} onChange={(event) => setProfileForm({ ...profileForm, documentNumber: event.target.value })} required />
        <input placeholder="Teléfono" value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} required />
        <fieldset><legend className="mb-3 text-sm text-slate-400">Categorías</legend><div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {categories.data?.map((category) => <label key={category.id} className="grid cursor-pointer grid-cols-[1.25rem_1fr] items-start gap-3 text-sm leading-5"><input className="mt-0.5 h-5 w-5 shrink-0 accent-brand-500" type="checkbox" checked={profileForm.categoryIds.includes(category.id)} onChange={(event) => setProfileForm({ ...profileForm, categoryIds: event.target.checked ? [...profileForm.categoryIds, category.id] : profileForm.categoryIds.filter((id) => id !== category.id) })} /><span>{category.name}</span></label>)}
        </div></fieldset>
        <textarea placeholder="Descripción profesional" value={profileForm.description} onChange={(event) => setProfileForm({ ...profileForm, description: event.target.value })} required />
        <textarea placeholder="Experiencia laboral" value={profileForm.workExperienceDescription} onChange={(event) => setProfileForm({ ...profileForm, workExperienceDescription: event.target.value })} required />
        <label className="text-sm">Foto de perfil<input type="file" accept=".jpg,.jpeg,.png" onChange={(event) => void profileFile('profilePhotoUrl', event.target.files?.[0])} /></label>
        <label className="text-sm">Documento obligatorio<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => void profileFile('documentPhotoUrl', event.target.files?.[0])} required={!profileForm.documentPhotoUrl} /></label>
        <label className="text-sm">Certificado opcional<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => void profileFile('certificatePhotoUrl', event.target.files?.[0])} /></label>
        <input placeholder="Dirección de domicilio" value={profileForm.homeAddress} onChange={(event) => setProfileForm({ ...profileForm, homeAddress: event.target.value })} required />
        <div className="grid grid-cols-2 gap-3"><input placeholder="Ciudad" value={profileForm.homeCity} onChange={(event) => setProfileForm({ ...profileForm, homeCity: event.target.value })} /><input placeholder="Barrio" value={profileForm.homeNeighborhood} onChange={(event) => setProfileForm({ ...profileForm, homeNeighborhood: event.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3"><input type="number" step="any" placeholder="Latitud domicilio" value={profileForm.homeLatitude} onChange={(event) => setProfileForm({ ...profileForm, homeLatitude: event.target.value })} required /><input type="number" step="any" placeholder="Longitud domicilio" value={profileForm.homeLongitude} onChange={(event) => setProfileForm({ ...profileForm, homeLongitude: event.target.value })} required /></div>
        <div className="grid grid-cols-2 gap-3"><input type="number" step="any" placeholder="Latitud" value={profileForm.latitude} onChange={(event) => setProfileForm({ ...profileForm, latitude: event.target.value })} required /><input type="number" step="any" placeholder="Longitud" value={profileForm.longitude} onChange={(event) => setProfileForm({ ...profileForm, longitude: event.target.value })} required /></div>
        <button type="button" onClick={useProfileLocation} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">Usar mi ubicación</button>
        <button className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">{profile.data ? 'Actualizar perfil' : 'Crear perfil'}</button>
      </form>}
      <RequestList title="Mis servicios" items={assigned.data ?? []} actionLabel={(item) => {
        const labels: Partial<Record<RequestStatus, string>> = { QUOTE_ACCEPTED: 'Ir en camino', ON_THE_WAY: 'Marcar llegada', ARRIVED: 'Iniciar servicio', IN_PROGRESS: 'Completar' }
        return item.status === 'PAID' ? 'Calificar cliente' : labels[item.status]
      }} onAction={(item) => item.status === 'PAID' ? rateClient(item) : advance(item)} onChat={setChatRequest} />
    </div>
    {profile.data?.status === 'APPROVED' && <div className="mt-8">
      <div className="mb-4 flex items-center gap-3"><label>Radio (km)</label><input className="max-w-28" type="number" min="1" max="100" value={radiusKm} onChange={(event) => setRadiusKm(event.target.value)} /></div>
      <section><h2 className="mb-4 text-xl font-bold">Solicitudes cercanas</h2><div className="space-y-3">
        {(available.data?.length ?? 0) === 0 && <p className="text-slate-400">No hay solicitudes dentro del radio.</p>}
        {available.data?.map((item) => <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          {item.firstServiceImageUrl && <img src={item.firstServiceImageUrl} alt="" className="mb-3 h-40 w-full rounded-xl object-cover" />}
          <strong>{item.categoryName}</strong><Reputation photo={item.clientProfilePhotoUrl} name={item.clientName} rating={item.clientAverageRating} services={item.clientPaidServicesCount} />
          <p className="mt-2 text-sm text-slate-400">{item.description}</p>{item.images?.length > 0 && <ImageGallery urls={item.images.map((image) => image.imageUrl)} />}
          {item.estimatedPrice != null && <p className="mt-2 font-bold text-brand-400">Estimado del cliente: ${item.estimatedPrice.toLocaleString()}</p>}
          <p className="mt-2 text-xs text-slate-500">{item.address} · {item.distanceKm?.toFixed(2)} km</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_2fr_auto]"><input type="number" min="1" placeholder="Tu cotización" value={quotes[item.id] ?? ''} onChange={(event) => setQuotes({ ...quotes, [item.id]: event.target.value })} /><input placeholder="Descripción de la oferta (opcional)" value={quoteDescriptions[item.id] ?? ''} onChange={(event) => setQuoteDescriptions({ ...quoteDescriptions, [item.id]: event.target.value })} /><button disabled={!quotes[item.id]} onClick={() => quote(item.id)} className="rounded-lg bg-brand-500 px-3 py-2 font-bold text-slate-950 disabled:opacity-50">Cotizar</button></div>
        </article>)}
      </div></section>
    </div>}
    {earnings.data && <div className="mt-8"><FinancialSummaryCard title="Mis ganancias" summary={earnings.data} /><FinancialList title="Historial de ganancias" items={earnings.data.payments} amount={(item) => item.technicianAmount} empty="Aún no tienes ganancias registradas." /></div>}
    {chatRequest && <ChatPanel request={chatRequest} currentUserId={session!.userId} onClose={() => setChatRequest(null)} />}
  </DashboardShell>
}
