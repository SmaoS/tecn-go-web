import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { api } from '../lib/api'
import { useAuth } from '../context/useAuth'
import type { Role, Session } from '../types'

function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mx-auto max-w-md px-6 py-16"><div className="rounded-3xl border border-slate-800 bg-slate-900 p-8"><h1 className="mb-6 text-3xl font-bold">{title}</h1>{children}</div></section>
}

function message(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.data?.message ?? 'No fue posible completar la solicitud' : 'Ocurrió un error inesperado'
}

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setSession } = useAuth()
  const navigate = useNavigate()

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const { data } = await api.post<Session>('/v1/auth/login', { email, password })
      setSession(data); navigate('/app')
    } catch (reason) { setError(message(reason)) } finally { setLoading(false) }
  }

  return <AuthShell title="Bienvenido de nuevo"><form onSubmit={submit} className="space-y-4">
    <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
    <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
    {error && <p className="text-sm text-red-400">{error}</p>}
    <button disabled={loading} className="w-full rounded-xl bg-brand-500 py-3 font-bold text-slate-950 disabled:opacity-50">{loading ? 'Ingresando...' : 'Ingresar'}</button>
    <p className="text-sm text-slate-400">¿Aún no tienes cuenta? <Link className="text-brand-400" to="/registro/cliente">Regístrate</Link></p>
  </form></AuthShell>
}

export function RegisterPage() {
  const { kind } = useParams()
  const [role, setRole] = useState<Role>(kind === 'tecnico' ? 'TECHNICIAN' : 'CLIENT')
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', referralCode: searchParams.get('ref') ?? '' })
  const [referralMessage, setReferralMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setSession } = useAuth()
  const navigate = useNavigate()

  async function validateReferral() {
    if (!form.referralCode.trim()) { setReferralMessage(''); return }
    try {
      const { data } = await api.get<{ valid: boolean; message: string }>(`/v1/referrals/validate/${encodeURIComponent(form.referralCode.trim())}`)
      setReferralMessage(data.message)
    } catch { setReferralMessage('No fue posible validar el código.') }
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const { data } = await api.post<Session>('/v1/auth/register', { ...form, role })
      setSession(data); navigate('/app')
    } catch (reason) { setError(message(reason)) } finally { setLoading(false) }
  }

  return <AuthShell title={role === 'CLIENT' ? 'Crea tu cuenta' : 'Únete como técnico'}><form onSubmit={submit} className="space-y-4">
    <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setRole('CLIENT')} className={`rounded-lg border p-2 ${role === 'CLIENT' ? 'border-brand-400 text-brand-300' : 'border-slate-700'}`}>Cliente</button><button type="button" onClick={() => setRole('TECHNICIAN')} className={`rounded-lg border p-2 ${role === 'TECHNICIAN' ? 'border-brand-400 text-brand-300' : 'border-slate-700'}`}>Técnico</button></div>
    <input placeholder="Nombre completo" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
    <input type="email" placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
    <input type="password" minLength={8} placeholder="Contraseña (mínimo 8 caracteres)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
    <input placeholder="Código de referido (opcional)" value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })} onBlur={() => void validateReferral()} />
    {referralMessage && <p className={`text-sm ${referralMessage.startsWith('Código válido') ? 'text-emerald-400' : 'text-amber-300'}`}>{referralMessage}</p>}
    <p className="text-sm text-slate-400">Después de ingresar podrás completar tu perfil, subir tu foto y enviar el documento para verificación.</p>
    {error && <p className="text-sm text-red-400">{error}</p>}
    <button disabled={loading} className="w-full rounded-xl bg-brand-500 py-3 font-bold text-slate-950">{loading ? 'Creando...' : 'Crear cuenta'}</button>
  </form></AuthShell>
}
