import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { roleHome } from '../../routes/paths'
import { useAuth } from '../../context/useAuth'
import { onboardingApi } from './api'

export function EmailConfirmationRequiredPage() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const status = useQuery({ queryKey: ['onboarding-status'], queryFn: onboardingApi.status, retry: false })
  const resend = useMutation({ mutationFn: onboardingApi.resendEmail })
  return <section className="mx-auto max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6">
    <h2 className="text-2xl font-bold">Confirma tu correo</h2>
    <p className="mt-3 text-slate-300">Debes confirmar tu correo electrónico para continuar usando TecnGo.</p>
    <div className="mt-5 flex flex-wrap gap-3">
      <button onClick={() => resend.mutate()} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">Reenviar correo</button>
      <button onClick={() => void status.refetch().then((result) => {
        if (result.data?.emailVerified && session) navigate(result.data.onboardingCompleted ? roleHome[session.role] : '/app/onboarding')
      })} className="rounded-xl border border-slate-700 px-5 py-3">Ya confirmé mi correo</button>
      <button onClick={logout} className="rounded-xl border border-slate-700 px-5 py-3">Cerrar sesión</button>
    </div>
    {resend.isSuccess && <p className="mt-3 text-sm text-emerald-400">Correo enviado.</p>}
  </section>
}
