import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { roleHome } from '../../routes/paths'
import { useAuth } from '../../context/useAuth'
import { uploadFile } from '../../lib/files'
import { GeographicFields } from '../catalogs/GeographicFields'
import { apiMessage } from '../shared/api'
import { onboardingApi } from './api'
import { LegalDocumentsContent } from '../legal/LegalDocumentsContent'
import { isValidLocalPhone, localPhoneHint, normalizeLocalPhone } from '../../lib/phone'

type DocumentType = 'CC' | 'PASSPORT'

const stepLabels: Record<string, string> = {
  MAIN_DATA: 'Datos principales',
  LEGAL_ACCEPTANCE: 'Documentos legales',
  PROFILE_SELFIE: 'Foto de perfil',
  IDENTITY_DOCUMENT: 'Documento de identidad',
  TECHNICIAN_PROFESSIONAL_PROFILE: 'Perfil profesional',
  TECHNICIAN_CERTIFICATE: 'Certificado técnico',
  COMPLETED: 'Inscripción lista',
}

export function OnboardingRequiredPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const status = useQuery({ queryKey: ['onboarding-status'], queryFn: onboardingApi.status, refetchInterval: false })
  const categories = useQuery({
    queryKey: ['service-categories', 'onboarding'],
    queryFn: onboardingApi.activeCategories,
    enabled: status.data?.currentStep === 'TECHNICIAN_PROFESSIONAL_PROFILE',
  })
  const [main, setMain] = useState({ fullName: session?.fullName ?? '', phone: '', countryId: '', departmentId: '', cityId: '', address: '', neighborhood: '', documentType: 'CC' as DocumentType, documentNumber: '' })
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('')
  const [frontUrl, setFrontUrl] = useState('')
  const [backUrl, setBackUrl] = useState('')
  const [singleUrl, setSingleUrl] = useState('')
  const [certificateUrl, setCertificateUrl] = useState('')
  const [professional, setProfessional] = useState({ categoryIds: [] as string[], workExperienceDescription: '' })
  const [showLegalPreview, setShowLegalPreview] = useState(false)
  const refresh = async () => queryClient.invalidateQueries({ queryKey: ['onboarding-status'] })

  const mainMutation = useMutation({ mutationFn: onboardingApi.mainData, onSuccess: refresh })
  const selfieMutation = useMutation({ mutationFn: onboardingApi.profileSelfie, onSuccess: refresh })
  const documentMutation = useMutation({ mutationFn: onboardingApi.identityDocument, onSuccess: refresh })
  const professionalMutation = useMutation({ mutationFn: onboardingApi.professionalProfile, onSuccess: refresh })
  const certificateMutation = useMutation({ mutationFn: onboardingApi.certificate, onSuccess: refresh })
  const skipCertificate = useMutation({ mutationFn: onboardingApi.skipCertificate, onSuccess: refresh })
  const pending = mainMutation.isPending || selfieMutation.isPending
    || documentMutation.isPending || professionalMutation.isPending
    || certificateMutation.isPending || skipCertificate.isPending
  const error = mainMutation.error || selfieMutation.error || documentMutation.error
    || professionalMutation.error || certificateMutation.error || skipCertificate.error

  useEffect(() => {
    if (status.data?.onboardingCompleted && session) navigate(roleHome[session.role])
  }, [navigate, session, status.data?.onboardingCompleted])

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
    <button
      type="button"
      onClick={() => setShowLegalPreview((value) => !value)}
      className="mt-4 rounded-xl border border-brand-500 px-4 py-2 text-sm font-bold text-brand-300"
    >
      {showLegalPreview ? 'Ocultar documentos legales' : 'Ver documentos legales'}
    </button>
    {showLegalPreview && <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <LegalDocumentsContent showAcceptButton={false} />
    </div>}
    {status.data?.currentStep === 'MAIN_DATA' && <form onSubmit={submitMain} className="mt-5 space-y-4">
      <p className="text-sm text-slate-400">Los campos marcados con * son obligatorios.</p>
      <input aria-label="Nombre completo obligatorio" placeholder="Nombre completo *" value={main.fullName} onChange={(event) => setMain({ ...main, fullName: event.target.value })} required />
      <input placeholder="Teléfono" inputMode="numeric" maxLength={10} pattern="\d{10}" value={main.phone} onChange={(event) => setMain({ ...main, phone: normalizeLocalPhone(event.target.value) })} />
      {main.phone && !isValidLocalPhone(main.phone) && <p className="text-sm text-red-400">{localPhoneHint}</p>}
      <div className="grid gap-3 sm:grid-cols-3">
        <GeographicFields countryId={main.countryId} departmentId={main.departmentId} cityId={main.cityId} onChange={(values) => setMain({ ...main, countryId: values.countryId ?? '', departmentId: values.departmentId ?? '', cityId: values.cityId ?? '' })} />
      </div>
      <input placeholder="Dirección *" value={main.address} onChange={(event) => setMain({ ...main, address: event.target.value })} required />
      <input placeholder="Barrio" value={main.neighborhood} onChange={(event) => setMain({ ...main, neighborhood: event.target.value })} />
      <select value={main.documentType} onChange={(event) => setMain({ ...main, documentType: event.target.value as DocumentType })}>
        <option value="CC">Cédula de ciudadanía</option>
        <option value="PASSPORT">Pasaporte</option>
      </select>
      <input placeholder="Número de documento *" value={main.documentNumber} onChange={(event) => setMain({ ...main, documentNumber: event.target.value })} required />
      <button disabled={pending || Boolean(main.phone) && !isValidLocalPhone(main.phone)} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">Guardar y continuar</button>
    </form>}
    {status.data?.currentStep === 'LEGAL_ACCEPTANCE' && <div className="mt-5 space-y-4">
      <p className="text-slate-300">Lee todos los documentos legales requeridos para tu rol.</p>
      <LegalDocumentsContent buttonLabel="Aceptar todos y continuar" onAccepted={refresh} />
    </div>}
    {status.data?.currentStep === 'PROFILE_SELFIE' && <div className="mt-5 space-y-4">
      <p className="text-slate-300">Carga una foto clara de tu rostro. Después quedará bloqueada para cambios desde tu perfil.</p>
      <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(event) => void upload(event, 'PROFILE', setProfilePhotoUrl)} />
      {profilePhotoUrl && <button disabled={pending} onClick={() => selfieMutation.mutate({ profilePhotoUrl, faceDetectionStatus: 'MANUAL_REVIEW_REQUIRED' })} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">Guardar selfie</button>}
    </div>}
    {status.data?.currentStep === 'IDENTITY_DOCUMENT' && <div className="mt-5 space-y-4">
      <p className="text-slate-300">{main.documentType === 'CC' ? 'Carga frente y reverso de tu cédula.' : 'Carga la página principal del pasaporte.'}</p>
      {main.documentType === 'CC' ? <>
        <label className="block text-sm">Frente<input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(event) => void upload(event, 'DOCUMENT', setFrontUrl)} /></label>
        <label className="block text-sm">Reverso<input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(event) => void upload(event, 'DOCUMENT', setBackUrl)} /></label>
        <button disabled={pending || !frontUrl || !backUrl} onClick={() => documentMutation.mutate({ documentType: 'CC', documentFrontUrl: frontUrl, documentBackUrl: backUrl, identityDocumentCaptureStatus: 'MANUAL_REVIEW_REQUIRED' })} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">Guardar documento</button>
      </> : <>
        <label className="block text-sm">Pasaporte<input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(event) => void upload(event, 'DOCUMENT', setSingleUrl)} /></label>
        <button disabled={pending || !singleUrl} onClick={() => documentMutation.mutate({ documentType: 'PASSPORT', documentSingleUrl: singleUrl, identityDocumentCaptureStatus: 'MANUAL_REVIEW_REQUIRED' })} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">Guardar documento</button>
      </>}
    </div>}
    {status.data?.currentStep === 'TECHNICIAN_PROFESSIONAL_PROFILE' && <div className="mt-5 space-y-4">
      <div>
        <h3 className="text-xl font-bold">Completa tu perfil técnico</h3>
        <p className="mt-1 text-slate-300">Cuéntale a los clientes qué servicios realizas, tu experiencia y especialidad.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {categories.data?.map((category) => <label key={category.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700 p-3">
          <input
            type="checkbox"
            checked={professional.categoryIds.includes(category.id)}
            onChange={(event) => setProfessional((current) => ({
              ...current,
              categoryIds: event.target.checked
                ? [...current.categoryIds, category.id]
                : current.categoryIds.filter((id) => id !== category.id),
            }))}
          />
          <span><strong>{category.name}</strong>{category.description && <small className="block text-slate-400">{category.description}</small>}</span>
        </label>)}
      </div>
      <textarea
        minLength={30}
        maxLength={1000}
        rows={6}
        placeholder="Describe tu experiencia"
        value={professional.workExperienceDescription}
        onChange={(event) => setProfessional({ ...professional, workExperienceDescription: event.target.value })}
      />
      <p className="text-xs text-slate-400">{professional.workExperienceDescription.trim().length}/1000 · mínimo 30 caracteres</p>
      <button
        disabled={pending || professional.categoryIds.length === 0 || professional.workExperienceDescription.trim().length < 30}
        onClick={() => professionalMutation.mutate({
          categoryIds: professional.categoryIds,
          workExperienceDescription: professional.workExperienceDescription.trim(),
        })}
        className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continuar
      </button>
    </div>}
    {status.data?.currentStep === 'TECHNICIAN_CERTIFICATE' && <div className="mt-5 space-y-4">
      <p className="text-slate-300">Si no tienes certificado de estudio, lo puedes cargar después.</p>
      <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(event) => void upload(event, 'CERTIFICATE', setCertificateUrl)} />
      <button disabled={pending || !certificateUrl} onClick={() => certificateMutation.mutate(certificateUrl)} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">Guardar certificado</button>
      <button disabled={pending} onClick={() => skipCertificate.mutate()} className="rounded-xl border border-slate-700 px-5 py-3">No tengo certificado ahora</button>
    </div>}
    {status.data?.currentStep === 'COMPLETED' && <p className="mt-5 text-slate-300">Tu inscripción está lista. Te estamos llevando al inicio.</p>}
    {error && <p className="mt-4 text-sm text-red-400">{apiMessage(error)}</p>}
  </section>
}
