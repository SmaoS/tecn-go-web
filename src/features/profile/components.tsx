import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { api } from '../../lib/api'
import { uploadFile } from '../../lib/files'
import { queryKeys } from '../../lib/queryClient'
import type { UserProfile, VerificationStatus } from '../../types'
import { apiMessage } from '../shared/api'

const verificationLabels: Record<VerificationStatus, string> = {
  CREATED: 'Cuenta creada: carga tu documento',
  PENDING_VERIFICATION: 'Documento pendiente de verificación',
  VERIFIED: 'Identidad verificada',
}

export function VerificationBadge({ value }: { value: VerificationStatus }) {
  const color = value === 'VERIFIED' ? 'text-emerald-400' : value === 'PENDING_VERIFICATION' ? 'text-amber-300' : 'text-slate-400'
  return <span className={`text-sm font-bold ${color}`}>{verificationLabels[value]}</span>
}

export function UserProfileEditor() {
  const [draft, setDraft] = useState<UserProfile | null>(null)
  const [error, setError] = useState('')
  const client = useQueryClient()
  const profile = useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => api.get<UserProfile>('/v1/users/me/profile').then(({ data }) => data),
  })
  const current = draft ?? profile.data
  const save = useMutation({
    mutationFn: (value: UserProfile) => api.put<UserProfile>('/v1/users/me/profile', value).then(({ data }) => data),
    onSuccess: (data) => {
      client.setQueryData(queryKeys.profile, data)
      setDraft(null)
    },
    onError: (reason) => setError(apiMessage(reason)),
  })
  const verifyEmail = useMutation({
    mutationFn: () => api.post('/v1/auth/send-email-verification'),
    onSuccess: () => setError('Correo de verificación enviado.'),
    onError: (reason) => setError(apiMessage(reason)),
  })
  async function file(field: 'profilePhotoUrl' | 'documentPhotoUrl', selected?: File) {
    if (!selected || !current) return
    try {
      setDraft({ ...current, [field]: await uploadFile(selected, field === 'profilePhotoUrl' ? 'PROFILE' : 'DOCUMENT') })
    } catch (reason) { setError(apiMessage(reason)) }
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    if (current) save.mutate(current)
  }
  function update(values: Partial<UserProfile>) {
    if (current) setDraft({ ...current, ...values })
  }
  function useHomeLocation() {
    navigator.geolocation.getCurrentPosition(({ coords }) => update({
      homeLatitude: coords.latitude,
      homeLongitude: coords.longitude,
    }), () => setError('No fue posible obtener la ubicación del navegador'))
  }
  if (!current) return null
  return <form onSubmit={submit} className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">Mi perfil y reputación</h2><span className="text-brand-400">★ {current.averageRating.toFixed(1)} · {current.paidServicesCount} pagados</span></div>
    <div className="mt-2"><VerificationBadge value={current.verificationStatus} /><p className="mt-1 text-sm text-slate-400">Correo: {current.emailVerified ? 'verificado' : 'pendiente'} · Documentos: {current.documentsVerified ? 'verificados' : 'pendientes'}</p></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <input value={current.fullName} onChange={(event) => update({ fullName: event.target.value })} required />
      <input placeholder="Teléfono" value={current.phone ?? ''} onChange={(event) => update({ phone: event.target.value })} />
      <input placeholder="Dirección de domicilio" value={current.homeAddress ?? ''} onChange={(event) => update({ homeAddress: event.target.value })} />
      <input placeholder="Ciudad" value={current.homeCity ?? ''} onChange={(event) => update({ homeCity: event.target.value })} />
      <input placeholder="Barrio" value={current.homeNeighborhood ?? ''} onChange={(event) => update({ homeNeighborhood: event.target.value })} />
      <div className="grid grid-cols-2 gap-2"><input type="number" step="any" placeholder="Latitud" value={current.homeLatitude ?? ''} onChange={(event) => update({ homeLatitude: Number(event.target.value) })} /><input type="number" step="any" placeholder="Longitud" value={current.homeLongitude ?? ''} onChange={(event) => update({ homeLongitude: Number(event.target.value) })} /></div>
      <label className="text-sm">Foto de perfil<input type="file" accept=".jpg,.jpeg,.png" onChange={(event) => void file('profilePhotoUrl', event.target.files?.[0])} /></label>
      <label className="text-sm">Documento de identidad<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => void file('documentPhotoUrl', event.target.files?.[0])} /></label>
    </div>
    {error && <p className="mt-2 text-sm text-slate-300">{error}</p>}
    <div className="mt-3 flex flex-wrap gap-2"><button className="rounded-lg border border-brand-500 px-3 py-2 text-sm text-brand-300">Guardar perfil</button><button type="button" onClick={useHomeLocation} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Usar mi ubicación</button>{!current.emailVerified && <button type="button" onClick={() => verifyEmail.mutate()} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Verificar correo</button>}</div>
  </form>
}
