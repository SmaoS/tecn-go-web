import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { roleHome } from '../../routes/paths'
import { useAuth } from '../../context/useAuth'
import { uploadFile } from '../../lib/files'
import { GeographicFields } from '../catalogs/GeographicFields'
import { apiMessage } from '../shared/api'
import { onboardingApi } from './api'

type DocumentType = 'CC' | 'PASSPORT'

const stepLabels: Record<string, string> = {
  MAIN_DATA: 'Datos principales',
  LEGAL_ACCEPTANCE: 'Documentos legales',
  PROFILE_SELFIE: 'Foto de perfil',
  IDENTITY_DOCUMENT: 'Documento de identidad',
  TECHNICIAN_CERTIFICATE: 'Certificado técnico',
  COMPLETED: 'Finalizar',
}

export function OnboardingRequiredPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const status = useQuery({ queryKey: ['onboarding-status'], queryFn: onboardingApi.status, refetchInterval: 10_000 })
  const [main, setMain] = useState({ fullName: session?.fullName ?? '', phone: '', countryId: '', departmentId: '', cityId: '', address: '', neighborhood: '', documentType: 'CC' as DocumentType, documentNumber: '' })
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('')
  const [frontUrl, setFrontUrl] = useState('')
  const [backUrl, setBackUrl] = useState('')
  const [singleUrl, setSingleUrl] = useState('')
  const [certificateUrl, setCertificateUrl] = useState('')
  const refresh = async () => queryClient.invalidateQueries({ queryKey: ['onboarding-status'] })

  const mainMutation = useMutation({ mutationFn: onboardingApi.mainData, onSuccess: refresh })
  const legalMutation = useMutation({ mutationFn: onboardingApi.legalAcceptance, onSuccess: refresh })
  const selfieMutation = useMutation({ mutationFn: onboardingApi.profileSelfie, onSuccess: refresh })
  const documentMutation = useMutation({ mutationFn: onboardingApi.identityDocument, onSuccess: refresh })
  const certificateMutation = useMutation({ mutationFn: onboardingApi.certificate, onSuccess: refresh })
  const skipCertificate = useMutation({ mutationFn: onboardingApi.skipCertificate, onSuccess: refresh })
  const complete = useMutation({
    mutationFn: onboardingApi.complete,
    onSuccess: () => session && navigate(roleHome[session.role]),
  })
  const pending = mainMutation.isPending || legalMutation.isPending || selfieMutation.isPending
    || documentMutation.isPending || certificateMutation.isPending || skipCertificate.isPending || complete.isPending
  const error = mainMutation.error || legalMutation.error || selfieMutation.error || documentMutation.error
    || certificateMutation.error || skipCertificate.error || complete.error

  async function upload(event: ChangeEvent<HTMLInputElement>, kind: 'PROFILE' | 'DOCUMENT' | 'CERTIFICATE', setUrl: (url: string) => void) {
    const file = event.target.files?.[0]
    if (!file) return
    setUrl(await uploadFile(file, kind))
  }

  function submitMain(event: FormEvent) {
    event.preventDefault()
    mainMutation.mutate(main)
  }

  return <section className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6">
    <h2 className="text-2xl font-bold">Completa tu inscripción</h2>
    <p className="mt-2 text-slate-300">Paso actual: <strong className="text-brand-300">{stepLabels[status.data?.currentStep ?? 'MAIN_DATA']}</strong></p>
    {status.data?.currentStep === 'MAIN_DATA' && <form onSubmit={submitMain} className="mt-5 space-y-4">
      <input placeholder="Nombre completo" value={main.fullName} onChange={(event) => setMain({ ...main, fullName: event.target.value })} required />
      <input placeholder="Teléfono" value={main.phone} onChange={(event) => setMain({ ...main, phone: event.target.value })} />
      <div className="grid gap-3 sm:grid-cols-3">
        <GeographicFields countryId={main.countryId} departmentId={main.departmentId} cityId={main.cityId} onChange={(values) => setMain({ ...main, countryId: values.countryId ?? '', departmentId: values.departmentId ?? '', cityId: values.cityId ?? '' })} />
      </div>
      <input placeholder="Dirección" value={main.address} onChange={(event) => setMain({ ...main, address: event.target.value })} required />
      <input placeholder="Barrio" value={main.neighborhood} onChange={(event) => setMain({ ...main, neighborhood: event.target.value })} />
      <select value={main.documentType} onChange={(event) => setMain({ ...main, documentType: event.target.value as DocumentType })}>
        <option value="CC">Cédula de ciudadanía</option>
        <option value="PASSPORT">Pasaporte</option>
      </select>
      <input placeholder="Número de documento" value={main.documentNumber} onChange={(event) => setMain({ ...main, documentNumber: event.target.value })} required />
      <button disabled={pending} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">Guardar y continuar</button>
    </form>}
    {status.data?.currentStep === 'LEGAL_ACCEPTANCE' && <div className="mt-5 space-y-4">
      <p className="text-slate-300">Acepta los documentos legales requeridos para tu rol.</p>
      <button disabled={pending} onClick={() => legalMutation.mutate()} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">Aceptar y continuar</button>
    </div>}
    {status.data?.currentStep === 'PROFILE_SELFIE' && <div className="mt-5 space-y-4">
      <p className="text-slate-300">Carga una foto clara de tu rostro. Después quedará bloqueada para cambios desde tu perfil.</p>
      <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(event) => void upload(event, 'PROFILE', setProfilePhotoUrl)} />
      {profilePhotoUrl && <button disabled={pending} onClick={() => selfieMutation.mutate(profilePhotoUrl)} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">Guardar selfie</button>}
    </div>}
    {status.data?.currentStep === 'IDENTITY_DOCUMENT' && <div className="mt-5 space-y-4">
      <p className="text-slate-300">{main.documentType === 'CC' ? 'Carga frente y reverso de tu cédula.' : 'Carga la página principal del pasaporte.'}</p>
      {main.documentType === 'CC' ? <>
        <label className="block text-sm">Frente<input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(event) => void upload(event, 'DOCUMENT', setFrontUrl)} /></label>
        <label className="block text-sm">Reverso<input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(event) => void upload(event, 'DOCUMENT', setBackUrl)} /></label>
        <button disabled={pending || !frontUrl || !backUrl} onClick={() => documentMutation.mutate({ documentType: 'CC', documentFrontUrl: frontUrl, documentBackUrl: backUrl })} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">Guardar documento</button>
      </> : <>
        <label className="block text-sm">Pasaporte<input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(event) => void upload(event, 'DOCUMENT', setSingleUrl)} /></label>
        <button disabled={pending || !singleUrl} onClick={() => documentMutation.mutate({ documentType: 'PASSPORT', documentSingleUrl: singleUrl })} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">Guardar documento</button>
      </>}
    </div>}
    {status.data?.currentStep === 'TECHNICIAN_CERTIFICATE' && <div className="mt-5 space-y-4">
      <p className="text-slate-300">Si no tienes certificado de estudio, lo puedes cargar después.</p>
      <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(event) => void upload(event, 'CERTIFICATE', setCertificateUrl)} />
      <button disabled={pending || !certificateUrl} onClick={() => certificateMutation.mutate(certificateUrl)} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">Guardar certificado</button>
      <button disabled={pending} onClick={() => skipCertificate.mutate()} className="rounded-xl border border-slate-700 px-5 py-3">No tengo certificado ahora</button>
    </div>}
    {status.data?.currentStep === 'COMPLETED' && <div className="mt-5 space-y-4">
      <p className="text-slate-300">Tu inscripción está lista. Finaliza para empezar a operar en TecnGo.</p>
      <button disabled={pending} onClick={() => complete.mutate()} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">Finalizar inscripción</button>
    </div>}
    {error && <p className="mt-4 text-sm text-red-400">{apiMessage(error)}</p>}
  </section>
}
