import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { roleHome } from '../../routes/paths'
import { useAuth } from '../../context/useAuth'
import { onboardingApi } from './api'
import { apiMessage } from '../shared/api'

export function EmailConfirmationRequiredPage() {
  const navigate = useNavigate()
  const { session, setSession, logout } = useAuth()
  const [editingEmail, setEditingEmail] = useState(false)
  const [emailForm, setEmailForm] = useState({ email: session?.email ?? '', confirmEmail: '' })
  const status = useQuery({ queryKey: ['onboarding-status'], queryFn: onboardingApi.status, retry: false })
  const resend = useMutation({ mutationFn: onboardingApi.resendEmail })
  const updateEmail = useMutation({
    mutationFn: onboardingApi.updateEmail,
    onSuccess: (data) => {
      if (session) setSession({ ...session, email: data.email, emailVerified: data.emailVerified })
      setEmailForm({ email: data.email, confirmEmail: '' })
      setEditingEmail(false)
    },
  })
  const emailsMatch = emailForm.email.trim().toLowerCase() === emailForm.confirmEmail.trim().toLowerCase()
  return <section className="mx-auto max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6">
    <h2 className="text-2xl font-bold">Confirma tu correo</h2>
    <p className="mt-3 text-slate-300">Debes confirmar tu correo electrónico para continuar usando TecnGo.</p>
    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-sm text-slate-400">Correo actual</p>
      <p className="mt-1 break-all font-bold text-brand-300">{session?.email ?? 'No hay correo registrado'}</p>
      {!editingEmail && <button
        type="button"
        onClick={() => {
          setEmailForm({ email: session?.email ?? '', confirmEmail: '' })
          setEditingEmail(true)
        }}
        className="mt-3 rounded-xl border border-brand-500 px-4 py-2 text-sm font-bold text-brand-300"
      >
        Modificar correo
      </button>}
    </div>
    {editingEmail && <div className="mt-4 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <input
        type="email"
        placeholder="Nuevo correo"
        value={emailForm.email}
        onChange={(event) => setEmailForm({ ...emailForm, email: event.target.value })}
      />
      <input
        type="email"
        placeholder="Confirmar nuevo correo"
        value={emailForm.confirmEmail}
        onChange={(event) => setEmailForm({ ...emailForm, confirmEmail: event.target.value })}
      />
      {emailForm.confirmEmail && !emailsMatch && <p className="text-sm text-red-400">Los correos no coinciden</p>}
      {updateEmail.error && <p className="text-sm text-red-400">{apiMessage(updateEmail.error)}</p>}
      {updateEmail.isSuccess && <p className="text-sm text-emerald-400">Correo actualizado. Enviamos un nuevo enlace de verificación.</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={updateEmail.isPending || !emailForm.email.trim() || !emailsMatch}
          onClick={() => updateEmail.mutate(emailForm)}
          className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950 disabled:opacity-50"
        >
          {updateEmail.isPending ? 'Actualizando...' : 'Actualizar correo'}
        </button>
        <button type="button" onClick={() => setEditingEmail(false)} className="rounded-xl border border-slate-700 px-5 py-3">
          Cancelar
        </button>
      </div>
    </div>}
    <div className="mt-5 flex flex-wrap gap-3">
      <button onClick={() => resend.mutate()} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950">Reenviar correo</button>
      <button onClick={() => void status.refetch().then((result) => {
        if ((result.data?.emailVerified || result.data?.phoneVerified) && session) navigate(result.data.onboardingCompleted ? roleHome[session.role] : '/app/onboarding')
      })} className="rounded-xl border border-slate-700 px-5 py-3">Ya confirmé mi correo</button>
      <button onClick={logout} className="rounded-xl border border-slate-700 px-5 py-3">Cerrar sesión</button>
    </div>
    {resend.isSuccess && <p className="mt-3 text-sm text-emerald-400">Correo enviado.</p>}
  </section>
}
