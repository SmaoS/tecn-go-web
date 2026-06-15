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
  const categories = useTechnicianCategories()
  const profile = useTechnicianProfile()
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
    try { setForm({ ...form, [field]: await uploadFile(selected, kind) }) } catch (reason) { setError(apiMessage(reason)) }
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
    <QueryState pending={categories.isPending || profile.isPending} error={categories.error}>
      <form onSubmit={submit} className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex justify-between">{profile.data && <><VerificationBadge value={profile.data.verificationStatus} /><span className="text-sm font-bold text-brand-400">{profile.data.status}</span></>}</div>
        <input placeholder="Documento" value={form.documentNumber} onChange={(event) => setForm({ ...form, documentNumber: event.target.value })} required />
        <input placeholder="Teléfono" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
        <fieldset><legend className="mb-3 text-sm text-slate-400">Categorías</legend><div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {categories.data?.map((category) => <label key={category.id} className="grid cursor-pointer grid-cols-[1.25rem_1fr] items-start gap-3 text-sm leading-5"><input className="mt-0.5 h-5 w-5 shrink-0 accent-brand-500" type="checkbox" checked={form.categoryIds.includes(category.id)} onChange={(event) => setForm({ ...form, categoryIds: event.target.checked ? [...form.categoryIds, category.id] : form.categoryIds.filter((id) => id !== category.id) })} /><span>{category.name}</span></label>)}
        </div></fieldset>
        <textarea placeholder="Descripción profesional" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
        <textarea placeholder="Experiencia laboral" value={form.workExperienceDescription} onChange={(event) => setForm({ ...form, workExperienceDescription: event.target.value })} required />
        <label className="text-sm">Foto de perfil<input type="file" accept=".jpg,.jpeg,.png" onChange={(event) => void file('profilePhotoUrl', event.target.files?.[0])} /></label>
        <label className="text-sm">Documento obligatorio<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => void file('documentPhotoUrl', event.target.files?.[0])} required={!form.documentPhotoUrl} /></label>
        <label className="text-sm">Certificado opcional<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => void file('certificatePhotoUrl', event.target.files?.[0])} /></label>
        <div className="grid gap-3 sm:grid-cols-3">
          <GeographicFields countryId={form.countryId} departmentId={form.departmentId} cityId={form.cityId} onChange={(values) => setForm({ ...form, countryId: values.countryId ?? '', departmentId: values.departmentId ?? '', cityId: values.cityId ?? '', homeCity: values.cityName ?? '' })} />
        </div>
        <label className="text-sm">Dirección de domicilio<input value={form.homeAddress} onChange={(event) => setForm({ ...form, homeAddress: event.target.value })} required /></label>
        <label className="text-sm">Barrio<input value={form.homeNeighborhood} onChange={(event) => setForm({ ...form, homeNeighborhood: event.target.value })} /></label>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={useLocation} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">{form.latitude && form.longitude ? 'Ubicación GPS lista' : 'Obtener mi ubicación GPS'}</button>{!session?.emailVerified && <button type="button" onClick={() => verifyEmail.mutate()} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">Verificar correo</button>}</div>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button disabled={save.isPending} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">{save.isPending ? 'Guardando...' : profile.data ? 'Actualizar perfil' : 'Crear perfil'}</button>
      </form>
    </QueryState>
  </section>
}
