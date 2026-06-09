import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { api } from '../lib/api'
import { useAuth } from '../context/useAuth'
import type { Role, Session } from '../types'
import { uploadFile } from '../lib/files'

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
  const role: Role = kind === 'tecnico' ? 'TECHNICIAN' : 'CLIENT'
  const [form, setForm] = useState({ fullName: '', email: '', password: '', profilePhotoUrl: '', documentPhotoUrl: '', certificatePhotoUrl: '', workExperienceDescription: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setSession } = useAuth()
  const navigate = useNavigate()

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const { data } = await api.post<Session>('/v1/auth/register', { ...form, role })
      setSession(data); navigate('/app')
    } catch (reason) { setError(message(reason)) } finally { setLoading(false) }
  }

  async function selectFile(field: 'profilePhotoUrl' | 'documentPhotoUrl' | 'certificatePhotoUrl', file?: File) {
    if (!file) return
    setLoading(true); setError('')
    const kind = field === 'profilePhotoUrl' ? 'PROFILE' : field === 'certificatePhotoUrl' ? 'CERTIFICATE' : 'DOCUMENT'
    try { setForm({ ...form, [field]: await uploadFile(file, kind) }) } catch (reason) { setError(message(reason)) } finally { setLoading(false) }
  }

  return <AuthShell title={role === 'CLIENT' ? 'Crea tu cuenta' : 'Únete como técnico'}><form onSubmit={submit} className="space-y-4">
    <input placeholder="Nombre completo" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
    <input type="email" placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
    <input type="password" minLength={8} placeholder="Contraseña (mínimo 8 caracteres)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
    <label className="block text-sm text-slate-300">Foto de perfil (opcional)<input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => void selectFile('profilePhotoUrl', e.target.files?.[0])} /></label>
    <label className="block text-sm text-slate-300">Documento (obligatorio)<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => void selectFile('documentPhotoUrl', e.target.files?.[0])} required={!form.documentPhotoUrl} /></label>
    {form.documentPhotoUrl && <p className="text-xs text-emerald-400">Documento cargado</p>}
    {role === 'TECHNICIAN' && <><label className="block text-sm text-slate-300">Certificado (opcional)<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => void selectFile('certificatePhotoUrl', e.target.files?.[0])} /></label><textarea placeholder="Describe brevemente tu experiencia" value={form.workExperienceDescription} onChange={(e) => setForm({ ...form, workExperienceDescription: e.target.value })} required /></>}
    {error && <p className="text-sm text-red-400">{error}</p>}
    <button disabled={loading} className="w-full rounded-xl bg-brand-500 py-3 font-bold text-slate-950">{loading ? 'Creando...' : 'Crear cuenta'}</button>
  </form></AuthShell>
}
