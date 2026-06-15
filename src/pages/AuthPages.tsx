import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { api } from '../lib/api'
import { useAuth } from '../context/useAuth'
import type { Role, Session } from '../types'
import { PasswordField } from '../components/PasswordField'

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
    <PasswordField placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
    {error && <p className="text-sm text-red-400">{error}</p>}
    <button disabled={loading} className="w-full rounded-xl bg-brand-500 py-3 font-bold text-slate-950 disabled:opacity-50">{loading ? 'Ingresando...' : 'Ingresar'}</button>
    <Link className="block text-center text-sm text-brand-400" to="/forgot-password">¿Olvidaste tu contraseña?</Link>
    <p className="text-sm text-slate-400">¿Aún no tienes cuenta? <Link className="text-brand-400" to="/registro/cliente">Regístrate</Link></p>
  </form></AuthShell>
}

export function RegisterPage() {
  const { kind } = useParams()
  const [role, setRole] = useState<Role>(kind === 'tecnico' ? 'TECHNICIAN' : 'CLIENT')
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', referralCode: searchParams.get('ref') ?? '' })
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
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden'); setLoading(false); return
    }
    try {
      const { data } = await api.post<Session>('/v1/auth/register', { ...form, role })
      setSession(data); navigate('/app')
    } catch (reason) { setError(message(reason)) } finally { setLoading(false) }
  }

  return <AuthShell title={role === 'CLIENT' ? 'Crea tu cuenta' : 'Únete como técnico'}><form onSubmit={submit} className="space-y-4">
    <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setRole('CLIENT')} className={`rounded-lg border p-2 ${role === 'CLIENT' ? 'border-brand-400 text-brand-300' : 'border-slate-700'}`}>Cliente</button><button type="button" onClick={() => setRole('TECHNICIAN')} className={`rounded-lg border p-2 ${role === 'TECHNICIAN' ? 'border-brand-400 text-brand-300' : 'border-slate-700'}`}>Técnico</button></div>
    <input placeholder="Nombre completo" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
    <input type="email" placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
    <PasswordField minLength={8} placeholder="Contraseña (mínimo 8 caracteres)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
    <PasswordField minLength={8} placeholder="Confirmar contraseña" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
    <input placeholder="Código de referido (opcional)" value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })} onBlur={() => void validateReferral()} />
    {referralMessage && <p className={`text-sm ${referralMessage.startsWith('Código válido') ? 'text-emerald-400' : 'text-amber-300'}`}>{referralMessage}</p>}
    <p className="text-sm text-slate-400">Después de ingresar podrás completar tu perfil, subir tu foto y enviar el documento para verificación.</p>
    {error && <p className="text-sm text-red-400">{error}</p>}
    <button disabled={loading} className="w-full rounded-xl bg-brand-500 py-3 font-bold text-slate-950">{loading ? 'Creando...' : 'Crear cuenta'}</button>
  </form></AuthShell>
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const { data } = await api.post<{ message: string }>('/v1/auth/forgot-password', { email })
      setNotice(data.message)
    } catch (reason) { setError(message(reason)) } finally { setLoading(false) }
  }
  return <AuthShell title="Recuperar contraseña"><form onSubmit={submit} className="space-y-4">
    <p className="text-sm text-slate-400">Te enviaremos un enlace si el correo está registrado.</p>
    <input type="email" placeholder="Correo" value={email} onChange={(event) => setEmail(event.target.value)} required />
    {notice && <p className="text-sm text-emerald-400">{notice}</p>}
    {error && <p className="text-sm text-red-400">{error}</p>}
    <button disabled={loading} className="w-full rounded-xl bg-brand-500 py-3 font-bold text-slate-950 disabled:opacity-50">{loading ? 'Enviando...' : 'Enviar instrucciones'}</button>
    <Link className="block text-center text-sm text-brand-400" to="/login">Volver al inicio de sesión</Link>
  </form></AuthShell>
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('')
    if (!token) { setError('El enlace de recuperación no contiene un token válido.'); return }
    if (newPassword !== confirmPassword) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    try {
      const { data } = await api.post<{ message: string }>('/v1/auth/reset-password', { token, newPassword, confirmPassword })
      setNotice(data.message)
    } catch (reason) { setError(message(reason)) } finally { setLoading(false) }
  }
  return <AuthShell title="Nueva contraseña"><form onSubmit={submit} className="space-y-4">
    <PasswordField minLength={8} placeholder="Nueva contraseña" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
    <PasswordField minLength={8} placeholder="Confirmar contraseña" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
    {notice && <p className="text-sm text-emerald-400">{notice} <Link className="text-brand-300" to="/login">Ingresar</Link></p>}
    {error && <p className="text-sm text-red-400">{error}</p>}
    <button disabled={loading || Boolean(notice)} className="w-full rounded-xl bg-brand-500 py-3 font-bold text-slate-950 disabled:opacity-50">{loading ? 'Actualizando...' : 'Cambiar contraseña'}</button>
  </form></AuthShell>
}
