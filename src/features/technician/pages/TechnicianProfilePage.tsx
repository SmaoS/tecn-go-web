import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../../context/useAuth'
import { uploadFile } from '../../../lib/files'
import { queryKeys } from '../../../lib/queryClient'
import { VerificationBadge } from '../../profile/components'
import { apiMessage } from '../../shared/api'
import { QueryState } from '../../shared/components/QueryState'
import { technicianApi } from '../api'
import { useTechnicianCategories, useTechnicianProfile } from '../hooks'
import type { TechnicianProfileForm } from '../types'
import { GeographicFields } from '../../catalogs/GeographicFields'
import { DataRightsPanel } from '../../compliance/DataRightsPanel'
import { isValidLocalPhone, localPhoneHint, normalizeLocalPhone } from '../../../lib/phone'
import { useProfile } from '../../profile/hooks'

const emptyProfile: TechnicianProfileForm = {
  documentNumber: '', phone: '', categoryIds: [], description: '',
  profilePhotoUrl: '', documentPhotoUrl: '', certificatePhotoUrl: '',
  workExperienceDescription: '', latitude: '', longitude: '', homeAddress: '',
  homeLatitude: '', homeLongitude: '', homeCity: '', homeNeighborhood: '',
  countryId: '', departmentId: '', cityId: '',
}

export function TechnicianProfilePage() {
  const { session } = useAuth()
  const client = useQueryClient()
  const [form, setForm] = useState(emptyProfile)
  const [error, setError] = useState('')
  const [fileUploading, setFileUploading] = useState(false)
  const categories = useTechnicianCategories()
  const profile = useTechnicianProfile()
  const userProfile = useProfile()
  useEffect(() => {
    if (!profile.data) return
    const data = profile.data
    setForm({
      documentNumber: data.documentNumber, phone: data.phone,
      categoryIds: data.categories.map((item) => item.id), description: data.description,
      profilePhotoUrl: data.profilePhotoUrl ?? '', documentPhotoUrl: data.documentPhotoUrl ?? '',
      certificatePhotoUrl: data.certificatePhotoUrl ?? '', workExperienceDescription: data.workExperienceDescription,
      latitude: String(data.latitude ?? ''), longitude: String(data.longitude ?? ''),
      homeAddress: data.homeAddress ?? '', homeLatitude: String(data.homeLatitude ?? ''),
      homeLongitude: String(data.homeLongitude ?? ''), homeCity: data.homeCity ?? '',
      homeNeighborhood: data.homeNeighborhood ?? '', countryId: data.countryId ?? '',
      departmentId: data.departmentId ?? '', cityId: data.cityId ?? '',
    })
  }, [profile.data])
  useEffect(() => {
    if (profile.data || !userProfile.data) return
    const data = userProfile.data
    setForm((current) => ({
      ...current,
      documentNumber: current.documentNumber || data.documentNumber || '',
      phone: current.phone || data.phone || '',
      profilePhotoUrl: current.profilePhotoUrl || data.profilePhotoUrl || '',
      documentPhotoUrl: current.documentPhotoUrl || data.documentPhotoUrl || '',
      certificatePhotoUrl: current.certificatePhotoUrl || data.certificatePhotoUrl || '',
      workExperienceDescription: current.workExperienceDescription || data.workExperienceDescription || '',
      homeAddress: current.homeAddress || data.homeAddress || '',
      homeLatitude: current.homeLatitude || String(data.homeLatitude ?? ''),
      homeLongitude: current.homeLongitude || String(data.homeLongitude ?? ''),
      homeCity: current.homeCity || data.homeCity || '',
      homeNeighborhood: current.homeNeighborhood || data.homeNeighborhood || '',
      countryId: current.countryId || data.countryId || '',
      departmentId: current.departmentId || data.departmentId || '',
      cityId: current.cityId || data.cityId || '',
    }))
  }, [profile.data, userProfile.data])
  const save = useMutation({
    mutationFn: () => technicianApi.saveProfile(profile.data ?? null, {
      ...form,
      latitude: Number(form.latitude), longitude: Number(form.longitude),
      homeLatitude: Number(form.homeLatitude), homeLongitude: Number(form.homeLongitude),
    }),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.technicianProfile }),
    onError: (reason) => setError(apiMessage(reason)),
  })
  const verifyEmail = useMutation({
    mutationFn: technicianApi.sendEmailVerification,
    onSuccess: () => setError('Correo de verificación enviado.'),
    onError: (reason) => setError(apiMessage(reason)),
  })
  async function file(field: 'profilePhotoUrl' | 'documentPhotoUrl' | 'certificatePhotoUrl', selected?: File) {
    if (!selected) return
    const kind = field === 'profilePhotoUrl' ? 'PROFILE' : field === 'certificatePhotoUrl' ? 'CERTIFICATE' : 'DOCUMENT'
    setFileUploading(true)
    try { setForm({ ...form, [field]: await uploadFile(selected, kind) }) } catch (reason) { setError(apiMessage(reason)) }
    finally { setFileUploading(false) }
  }
  function useLocation() {
    navigator.geolocation.getCurrentPosition(({ coords }) => setForm((value) => ({
      ...value, latitude: String(coords.latitude), longitude: String(coords.longitude),
      homeLatitude: String(coords.latitude), homeLongitude: String(coords.longitude),
    })), () => setError('No fue posible obtener la ubicación. Revisa el permiso del navegador.'), {
      enableHighAccuracy: true, timeout: 10_000,
    })
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    save.mutate()
  }

  return <section className="max-w-3xl"><h2 className="mb-4 text-2xl font-bold">Mi perfil técnico</h2>
    <QueryState pending={categories.isPending || profile.isPending || userProfile.isPending} error={categories.error ?? userProfile.error}>
      <form onSubmit={submit} className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex justify-between">{profile.data && <><VerificationBadge value={profile.data.verificationStatus} /><span className="text-sm font-bold text-brand-400">{profile.data.status}</span></>}</div>
        <label className="text-sm">Documento
          <input placeholder="Documento" value={form.documentNumber}
            readOnly={Boolean((userProfile.data?.documentNumber || profile.data?.documentNumber))}
            onChange={(event) => setForm({ ...form, documentNumber: event.target.value })} required />
          {userProfile.data?.documentNumber && !profile.data?.documentNumber && <span className="mt-1 block text-xs text-slate-400">Tomado del perfil de cliente.</span>}
        </label>
        <input placeholder="Teléfono" inputMode="numeric" maxLength={10} pattern="\d{10}" value={form.phone} onChange={(event) => setForm({ ...form, phone: normalizeLocalPhone(event.target.value) })} required />
        {form.phone && !isValidLocalPhone(form.phone) && <p className="text-sm text-red-400">{localPhoneHint}</p>}
        <fieldset><legend className="mb-3 text-sm text-slate-400">Categorías</legend><div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {categories.data?.map((category) => <label key={category.id} className="grid cursor-pointer grid-cols-[1.25rem_1fr] items-start gap-3 text-sm leading-5"><input className="mt-0.5 h-5 w-5 shrink-0 accent-brand-500" type="checkbox" checked={form.categoryIds.includes(category.id)} onChange={(event) => setForm({ ...form, categoryIds: event.target.checked ? [...form.categoryIds, category.id] : form.categoryIds.filter((id) => id !== category.id) })} /><span>{category.name}</span></label>)}
        </div></fieldset>
        <textarea placeholder="Descripción profesional" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
        <textarea placeholder="Experiencia laboral" value={form.workExperienceDescription} onChange={(event) => setForm({ ...form, workExperienceDescription: event.target.value })} required />
        {!profile.data?.profilePhotoFaceValidated && <label className="text-sm">Foto de perfil<input type="file" accept=".jpg,.jpeg,.png" onChange={(event) => void file('profilePhotoUrl', event.target.files?.[0])} /></label>}
        <label className="text-sm">Documento obligatorio<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => void file('documentPhotoUrl', event.target.files?.[0])} required={!form.documentPhotoUrl} /></label>
        <label className="text-sm">Certificado opcional<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => void file('certificatePhotoUrl', event.target.files?.[0])} /></label>
        <div className="grid gap-3 sm:grid-cols-3">
          <GeographicFields countryId={form.countryId} departmentId={form.departmentId} cityId={form.cityId} onChange={(values) => setForm({ ...form, countryId: values.countryId ?? '', departmentId: values.departmentId ?? '', cityId: values.cityId ?? '', homeCity: values.cityName ?? '' })} />
        </div>
        <label className="text-sm">Dirección de domicilio<input value={form.homeAddress} onChange={(event) => setForm({ ...form, homeAddress: event.target.value })} required /></label>
        <label className="text-sm">Barrio<input value={form.homeNeighborhood} onChange={(event) => setForm({ ...form, homeNeighborhood: event.target.value })} /></label>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={useLocation} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">{form.latitude && form.longitude ? 'Ubicación GPS lista' : 'Obtener mi ubicación GPS'}</button>{!session?.emailVerified && <button type="button" onClick={() => verifyEmail.mutate()} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">Verificar correo</button>}</div>
        {fileUploading && <p className="text-sm text-brand-300">Cargando archivo...</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button disabled={save.isPending || fileUploading || !form.documentPhotoUrl || !isValidLocalPhone(form.phone)} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">{save.isPending || fileUploading ? 'Guardando...' : profile.data ? 'Actualizar perfil' : 'Crear perfil'}</button>
      </form>
    </QueryState>
    <DataRightsPanel />
  </section>
}
