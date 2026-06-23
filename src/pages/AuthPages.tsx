import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { api } from '../lib/api'
import { useAuth } from '../context/useAuth'
import type { Role, Session } from '../types'
import { PasswordField } from '../components/PasswordField'
import { isValidLocalPhone, localPhoneHint, normalizeLocalPhone } from '../lib/phone'

function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mx-auto max-w-md px-5 py-12 sm:py-16">
    <div className="mb-7 flex justify-center"><img src="/tecngo-logo-dark.png" alt="TecnGo" className="h-14 w-auto" /></div>
    <div className="tecngo-panel p-6 sm:p-8">
      <p className="mb-2 text-sm font-bold uppercase tracking-[.16em] text-brand-400">TecnGo</p>
      <h1 className="mb-7 text-3xl font-extrabold tracking-tight">{title}</h1>
      {children}
    </div>
  </section>
}

function message(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.data?.message ?? 'No fue posible completar la solicitud' : 'Ocurrió un error inesperado'
}

export function LoginPage() {
  const [method, setMethod] = useState<'email' | 'phone'>('email')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mfaChallenge, setMfaChallenge] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const { setSession } = useAuth()
  const navigate = useNavigate()
  const canLogin = (method === 'email' ? identifier.trim().length > 0 : isValidLocalPhone(identifier)) && password.length > 0

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('')
    if (!canLogin) { setLoading(false); return }
    try {
      const endpoint = method === 'email' ? '/v1/auth/login' : '/v1/auth/login-by-phone'
      const payload = method === 'email'
        ? { email: identifier.trim(), password }
        : { phone: normalizeLocalPhone(identifier), password }
      const { data } = await api.post<Session & {
        mfaRequired?: boolean
        mfaChallengeToken?: string
      }>(endpoint, payload)
      if (data.mfaRequired && data.mfaChallengeToken) {
        setMfaChallenge(data.mfaChallengeToken)
        return
      }
      setSession(data)
      navigate('/app')
    } catch (reason) { setError(message(reason)) } finally { setLoading(false) }
  }

  async function verifyMfa(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const { data } = await api.post<Session>('/v1/auth/mfa/verify', {
        challengeToken: mfaChallenge,
        code: mfaCode,
      })
      setSession(data)
      navigate('/app')
    } catch (reason) { setError(message(reason)) } finally { setLoading(false) }
  }

  if (mfaChallenge) {
    return <AuthShell title="Verificación administrativa"><form onSubmit={verifyMfa} className="space-y-4">
      <p className="text-sm text-slate-400">Enviamos un código de seis dígitos al correo de la cuenta.</p>
      <input inputMode="numeric" maxLength={6} placeholder="Código MFA" value={mfaCode}
        onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, ''))} required />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button disabled={loading || mfaCode.length !== 6}
        className="w-full rounded-xl bg-brand-500 py-3 font-bold text-slate-950 disabled:opacity-50">
        {loading ? 'Verificando...' : 'Verificar e ingresar'}
      </button>
      <button type="button" className="w-full text-sm text-brand-400"
        onClick={() => { setMfaChallenge(''); setMfaCode('') }}>
        Volver al inicio de sesión
      </button>
    </form></AuthShell>
  }

  return <AuthShell title="Bienvenido de nuevo"><form onSubmit={submit} className="space-y-4">
    <div className="grid grid-cols-2 gap-2">
      <button type="button" onClick={() => { setMethod('email'); setIdentifier('') }} className={`rounded-lg border p-2 ${method === 'email' ? 'border-brand-400 text-brand-300' : 'border-slate-700'}`}>Correo</button>
      <button type="button" onClick={() => { setMethod('phone'); setIdentifier('') }} className={`rounded-lg border p-2 ${method === 'phone' ? 'border-brand-400 text-brand-300' : 'border-slate-700'}`}>Celular</button>
    </div>
    <input type={method === 'email' ? 'email' : 'tel'} inputMode={method === 'phone' ? 'numeric' : undefined} maxLength={method === 'phone' ? 10 : undefined} pattern={method === 'phone' ? '\\d{10}' : undefined} placeholder={method === 'email' ? 'Correo' : 'Celular, ej. 3001234567'} value={identifier} onChange={(e) => setIdentifier(method === 'phone' ? normalizeLocalPhone(e.target.value) : e.target.value)} required />
    {method === 'phone' && identifier.length > 0 && !isValidLocalPhone(identifier) && <p className="text-sm text-red-400">{localPhoneHint}</p>}
    <PasswordField placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
    {error && <p className="text-sm text-red-400">{error}</p>}
    <button disabled={loading || !canLogin} className="w-full rounded-xl bg-brand-500 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Ingresando...' : 'Ingresar'}</button>
    <Link className="block text-center text-sm text-brand-400" to="/forgot-password">¿Olvidaste tu contraseña?</Link>
    <p className="text-sm text-slate-400">¿Aún no tienes cuenta? <Link className="text-brand-400" to="/registro/cliente">Regístrate</Link></p>
  </form></AuthShell>
}

export function RegisterPage() {
  const { kind } = useParams()
  const [role, setRole] = useState<Role>(kind === 'tecnico' ? 'TECHNICIAN' : 'CLIENT')
  const [searchParams] = useSearchParams()
  const [method, setMethod] = useState<'email' | 'phone'>('email')
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '', referralCode: searchParams.get('ref') ?? '' })
  const [otpCode, setOtpCode] = useState('')
  const [verificationToken, setVerificationToken] = useState('')
  const [otpNotice, setOtpNotice] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
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
      if (method === 'phone' && !verificationToken) {
        setError('Verifica el código enviado a tu celular'); setLoading(false); return
      }
      const endpoint = method === 'email' ? '/v1/auth/register' : '/v1/auth/register-by-phone'
      const payload = method === 'email'
        ? { fullName: form.fullName, email: form.email, password: form.password, confirmPassword: form.confirmPassword, referralCode: form.referralCode, role }
        : { fullName: form.fullName, phone: normalizeLocalPhone(form.phone), verificationToken, password: form.password, confirmPassword: form.confirmPassword, referralCode: form.referralCode, role }
      const { data } = await api.post<Session>(endpoint, payload)
      setSession(data); navigate('/app')
    } catch (reason) { setError(message(reason)) } finally { setLoading(false) }
  }

  async function sendOtp() {
    setOtpLoading(true); setError(''); setOtpNotice('')
    try {
      const { data } = await api.post<{ message: string; debugCode?: string }>('/v1/auth/phone/send-otp', { phone: normalizeLocalPhone(form.phone) })
      setOtpNotice(data.debugCode ? `Código enviado. Código de desarrollo: ${data.debugCode}` : 'Código enviado por SMS.')
    } catch (reason) { setError(message(reason)) } finally { setOtpLoading(false) }
  }

  async function verifyOtp() {
    setOtpLoading(true); setError('')
    try {
      const { data } = await api.post<{ verificationToken: string }>('/v1/auth/phone/verify-otp', { phone: normalizeLocalPhone(form.phone), code: otpCode })
      setVerificationToken(data.verificationToken); setOtpNotice('Celular verificado correctamente.')
    } catch (reason) { setError(message(reason)) } finally { setOtpLoading(false) }
  }

  return <AuthShell title={role === 'CLIENT' ? 'Crea tu cuenta' : 'Únete como técnico'}><form onSubmit={submit} className="space-y-4">
    <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setRole('CLIENT')} className={`rounded-lg border p-2 ${role === 'CLIENT' ? 'border-brand-400 text-brand-300' : 'border-slate-700'}`}>Cliente</button><button type="button" onClick={() => setRole('TECHNICIAN')} className={`rounded-lg border p-2 ${role === 'TECHNICIAN' ? 'border-brand-400 text-brand-300' : 'border-slate-700'}`}>Técnico</button></div>
    <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setMethod('email')} className={`rounded-lg border p-2 ${method === 'email' ? 'border-brand-400 text-brand-300' : 'border-slate-700'}`}>Con correo</button><button type="button" onClick={() => setMethod('phone')} className={`rounded-lg border p-2 ${method === 'phone' ? 'border-brand-400 text-brand-300' : 'border-slate-700'}`}>Con celular</button></div>
    <input placeholder="Nombre completo" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
    {method === 'email'
      ? <input type="email" placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      : <><div className="flex gap-2"><input type="tel" inputMode="numeric" maxLength={10} pattern="\d{10}" placeholder="Celular, ej. 3001234567" value={form.phone} onChange={(e) => { setForm({ ...form, phone: normalizeLocalPhone(e.target.value) }); setVerificationToken('') }} required /><button type="button" disabled={otpLoading || !isValidLocalPhone(form.phone)} onClick={() => void sendOtp()} className="rounded-xl border border-brand-500 px-3 text-sm disabled:opacity-50">Enviar código</button></div>
        {form.phone.length > 0 && !isValidLocalPhone(form.phone) && <p className="text-sm text-red-400">{localPhoneHint}</p>}
        <div className="flex gap-2"><input inputMode="numeric" maxLength={8} placeholder="Código OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} /><button type="button" disabled={otpLoading || !otpCode || !isValidLocalPhone(form.phone) || Boolean(verificationToken)} onClick={() => void verifyOtp()} className="rounded-xl border border-brand-500 px-3 text-sm disabled:opacity-50">{verificationToken ? 'Verificado' : 'Verificar'}</button></div>
        {otpNotice && <p className="text-sm text-emerald-400">{otpNotice}</p>}</>}
    <PasswordField minLength={8} placeholder="Contraseña (mínimo 8 caracteres)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
    <PasswordField minLength={8} placeholder="Confirmar contraseña" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
    <input placeholder="Código de referido (opcional)" value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })} onBlur={() => void validateReferral()} />
    {referralMessage && <p className={`text-sm ${referralMessage.startsWith('Código válido') ? 'text-emerald-400' : 'text-amber-300'}`}>{referralMessage}</p>}
    <p className="text-sm text-slate-400">Después de ingresar podrás completar tu perfil, subir tu foto y enviar el documento para verificación.</p>
    {error && <p className="text-sm text-red-400">{error}</p>}
    <button disabled={loading || (method === 'phone' && (!verificationToken || !isValidLocalPhone(form.phone)))} className="w-full rounded-xl bg-brand-500 py-3 font-bold text-slate-950 disabled:opacity-50">{loading ? 'Creando...' : 'Crear cuenta'}</button>
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
