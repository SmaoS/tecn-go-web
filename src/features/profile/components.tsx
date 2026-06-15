import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { uploadFile } from '../../lib/files'
import type { UserProfile, VerificationStatus } from '../../types'
import { apiMessage } from '../shared/api'
import { QueryState } from '../shared/components/QueryState'
import { profileApi } from './api'
import { useProfile, useSaveProfile } from './hooks'
import { PasswordField } from '../../components/PasswordField'

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
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordNotice, setPasswordNotice] = useState('')
  const profile = useProfile()
  const current = draft ?? profile.data
  const save = useSaveProfile()
  const verifyEmail = useMutation({
    mutationFn: profileApi.verifyEmail,
    onSuccess: () => setError('Correo de verificación enviado.'),
    onError: (reason) => setError(apiMessage(reason)),
  })
  const changePassword = useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: ({ message }) => {
      setPasswordNotice(message)
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (reason) => setPasswordNotice(apiMessage(reason)),
  })
  async function file(field: 'profilePhotoUrl' | 'documentPhotoUrl', selected?: File) {
    if (!selected || !current) return
    try {
      setDraft({ ...current, [field]: await uploadFile(selected, field === 'profilePhotoUrl' ? 'PROFILE' : 'DOCUMENT') })
    } catch (reason) { setError(apiMessage(reason)) }
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    if (current) save.mutate(current, {
      onSuccess: () => setDraft(null),
      onError: (reason) => setError(apiMessage(reason)),
    })
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
  return <QueryState pending={profile.isPending} error={profile.error}>
    {current && <form onSubmit={submit} className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">Mi perfil y reputación</h2><span className="text-brand-400">★ {current.averageRating.toFixed(1)} · {current.paidServicesCount} pagados</span></div>
    <div className="mt-2"><VerificationBadge value={current.verificationStatus} /><p className="mt-1 text-sm text-slate-400">Correo: {current.emailVerified ? 'verificado' : 'pendiente'} · Documentos: {current.documentsVerified ? 'verificados' : 'pendientes'}</p></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <input value={current.fullName} onChange={(event) => update({ fullName: event.target.value })} required />
      <input type="email" value={current.email} disabled readOnly className="cursor-not-allowed opacity-70" aria-label="Correo registrado" />
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
    </form>}
    {current && <form onSubmit={(event) => {
      event.preventDefault()
      setPasswordNotice('')
      if (passwords.newPassword !== passwords.confirmPassword) {
        setPasswordNotice('Las contraseñas no coinciden')
        return
      }
      changePassword.mutate(passwords)
    }} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="mb-4 font-bold">Cambiar contraseña</h2>
      <div className="grid gap-3">
        <PasswordField placeholder="Contraseña actual" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} required />
        <PasswordField minLength={8} placeholder="Nueva contraseña" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} required />
        <PasswordField minLength={8} placeholder="Confirmar nueva contraseña" value={passwords.confirmPassword} onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })} required />
      </div>
      {passwordNotice && <p className="mt-3 text-sm text-slate-300">{passwordNotice}</p>}
      <button disabled={changePassword.isPending} className="mt-3 rounded-lg border border-brand-500 px-3 py-2 text-sm text-brand-300 disabled:opacity-50">
        {changePassword.isPending ? 'Actualizando...' : 'Actualizar contraseña'}
      </button>
    </form>}
  </QueryState>
}
