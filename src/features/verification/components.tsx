import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { queryKeys } from '../../lib/queryClient'
import { apiMessage } from '../shared/api'
import { QueryState } from '../shared/components/QueryState'
import { verificationApi } from './api'
import { usePendingVerifications, useVerifiers } from './hooks'
import type { VerifierForm } from './types'

export function VerificationQueue() {
  const client = useQueryClient()
  const [error, setError] = useState('')
  const items = usePendingVerifications()
  const review = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'verify' | 'reject' | 'photo' }) =>
      decision === 'verify' ? verificationApi.verify(id)
        : decision === 'photo' ? verificationApi.verifyProfilePhoto(id)
          : verificationApi.reject(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.verifications }),
    onError: (reason) => setError(apiMessage(reason)),
  })
  async function openEvidence(url?: string) {
    if (!url) return
    try {
      window.open(URL.createObjectURL(await verificationApi.evidence(url)), '_blank', 'noopener,noreferrer')
    } catch (reason) { setError(apiMessage(reason)) }
  }

  return <section className="mb-8"><h2 className="mb-4 text-xl font-bold">Identidades pendientes ({items.data?.length ?? 0})</h2>
    {error && <p className="mb-3 text-red-400">{error}</p>}
    <QueryState pending={items.isPending} error={items.error} empty={items.data?.length === 0}><div className="grid gap-4 md:grid-cols-2">
      {items.data?.map((item) => <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{item.fullName}</h3><p className="text-sm text-slate-400">{item.email}</p></div><span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">{item.role}</span></div>
        {item.workExperienceDescription && <p className="mt-3 text-sm text-slate-400">{item.workExperienceDescription}</p>}
        <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => void openEvidence(item.documentPhotoUrl)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Ver documento</button>{item.certificatePhotoUrl && <button onClick={() => void openEvidence(item.certificatePhotoUrl)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Ver certificado</button>}{item.profilePhotoUrl && <><button onClick={() => window.open(item.profilePhotoUrl, '_blank', 'noopener,noreferrer')} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Ver foto perfil</button><button onClick={() => review.mutate({ id: item.id, decision: 'photo' })} className="rounded-lg border border-brand-500 px-3 py-2 text-sm text-brand-300">Validar rostro visible</button></>}</div>
        <div className="mt-4 flex gap-2"><button onClick={() => review.mutate({ id: item.id, decision: 'verify' })} className="rounded-lg bg-emerald-500 px-4 py-2 font-bold text-slate-950">Marcar verificado</button><button onClick={() => review.mutate({ id: item.id, decision: 'reject' })} className="rounded-lg border border-red-500 px-4 py-2 text-red-300">Rechazar</button></div>
      </article>)}
    </div></QueryState>
  </section>
}

const emptyVerifier: VerifierForm = {
  fullName: '', email: '', password: '', homeAddress: '', homeCity: '',
  homeNeighborhood: '', homeLatitude: '', homeLongitude: '',
}

export function VerifierManager() {
  const client = useQueryClient()
  const [form, setForm] = useState(emptyVerifier)
  const [error, setError] = useState('')
  const items = useVerifiers()
  const create = useMutation({
    mutationFn: () => verificationApi.createVerifier({
      ...form,
      homeLatitude: form.homeLatitude ? Number(form.homeLatitude) : null,
      homeLongitude: form.homeLongitude ? Number(form.homeLongitude) : null,
    }),
    onSuccess: async () => {
      setForm(emptyVerifier)
      await client.invalidateQueries({ queryKey: queryKeys.adminVerifiers })
    },
    onError: (reason) => setError(apiMessage(reason)),
  })
  function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    create.mutate()
  }

  return <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5"><h2 className="text-xl font-bold">Verificadores</h2><p className="mt-1 text-sm text-slate-400">Estas cuentas solo pueden ser creadas por un administrador.</p>
    <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-3"><input placeholder="Nombre completo" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required /><input type="email" placeholder="Correo" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /><input type="password" minLength={8} placeholder="Contraseña temporal" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /><input placeholder="Dirección domicilio" value={form.homeAddress} onChange={(event) => setForm({ ...form, homeAddress: event.target.value })} /><input placeholder="Ciudad" value={form.homeCity} onChange={(event) => setForm({ ...form, homeCity: event.target.value })} /><input placeholder="Barrio" value={form.homeNeighborhood} onChange={(event) => setForm({ ...form, homeNeighborhood: event.target.value })} /><input type="number" step="any" placeholder="Latitud" value={form.homeLatitude} onChange={(event) => setForm({ ...form, homeLatitude: event.target.value })} /><input type="number" step="any" placeholder="Longitud" value={form.homeLongitude} onChange={(event) => setForm({ ...form, homeLongitude: event.target.value })} /><button className="rounded-lg bg-brand-500 px-4 py-2 font-bold text-slate-950">Crear verificador</button></form>
    {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    <QueryState pending={items.isPending} error={items.error}><div className="mt-4 flex flex-wrap gap-2">{items.data?.map((item) => <span key={item.id} className="rounded-full border border-slate-700 px-3 py-2 text-sm">{item.fullName} · {item.email}</span>)}</div></QueryState>
  </section>
}
