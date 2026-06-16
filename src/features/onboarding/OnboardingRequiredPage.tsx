import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { onboardingApi } from './api'

const stepLabels: Record<string, string> = {
  MAIN_DATA: 'Datos principales',
  LEGAL_ACCEPTANCE: 'Aceptar documentos legales',
  PROFILE_SELFIE: 'Foto de perfil',
  IDENTITY_DOCUMENT: 'Documento de identidad',
  TECHNICIAN_CERTIFICATE: 'Certificado técnico opcional',
  COMPLETED: 'Listo para completar',
}

export function OnboardingRequiredPage() {
  const status = useQuery({ queryKey: ['onboarding-status'], queryFn: onboardingApi.status })
  return <section className="mx-auto max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6">
    <h2 className="text-2xl font-bold">Completa tu inscripción</h2>
    <p className="mt-3 text-slate-300">Antes de operar en TecnGo necesitamos completar tu información básica, documentos y términos.</p>
    <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <p className="text-sm text-slate-400">Paso actual</p>
      <p className="text-lg font-bold text-brand-300">{stepLabels[status.data?.currentStep ?? 'MAIN_DATA']}</p>
    </div>
    <div className="mt-5 flex flex-wrap gap-3">
      <Link to="../cliente/perfil" className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">Ir a Mi perfil</Link>
      <Link to="../cliente/legal" className="rounded-xl border border-slate-700 px-5 py-3">Ver documentos legales</Link>
    </div>
  </section>
}
