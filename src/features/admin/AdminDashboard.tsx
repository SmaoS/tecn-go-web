import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { queryKeys } from '../../lib/queryClient'
import type { ServiceCategory, SystemParameter } from '../../types'
import { NotificationCenter } from '../notifications/NotificationCenter'
import { FinancialList, FinancialSummaryCard, Metric } from '../payments/components'
import { UserProfileEditor, VerificationBadge } from '../profile/components'
import { apiMessage } from '../shared/api'
import { DashboardShell } from '../shared/components/DashboardShell'
import { VerificationQueue, VerifierManager } from '../verification/components'
import { adminApi } from './api'
import { SystemParametersPanel, TechnicianLocationsPanel } from './components'
import { useAdminDashboardData } from './hooks'
import type { CategoryForm } from './types'

export function AdminDashboard() {
  const client = useQueryClient()
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({ name: '', description: '', active: true })
  const [error, setError] = useState('')
  const { pending, categories, finances, summary, parameters, locations } = useAdminDashboardData()

  const refresh = () => client.invalidateQueries({ queryKey: queryKeys.admin })
  const action = useMutation({
    mutationFn: (run: () => Promise<unknown>) => run(),
    onSuccess: refresh,
    onError: (reason) => setError(apiMessage(reason)),
  })
  function createCategory(event: FormEvent) {
    event.preventDefault()
    action.mutate(() => adminApi.createCategory(categoryForm), {
      onSuccess: () => setCategoryForm({ name: '', description: '', active: true }),
    })
  }
  function editCategory(category: ServiceCategory) {
    const name = window.prompt('Nombre de la categoría', category.name)
    if (!name) return
    const description = window.prompt('Descripción', category.description) ?? category.description
    action.mutate(() => adminApi.updateCategory({ ...category, name, description }))
  }
  function deleteCategory(category: ServiceCategory) {
    if (window.confirm(`¿Desactivar ${category.name}?`)) action.mutate(() => adminApi.deleteCategory(category.id))
  }
  async function openEvidence(url?: string) {
    if (!url) return
    try {
      window.open(URL.createObjectURL(await adminApi.evidence(url)), '_blank', 'noopener,noreferrer')
    } catch (reason) { setError(apiMessage(reason)) }
  }
  function updateParameter(parameter: SystemParameter, value: string) {
    return action.mutateAsync(() => adminApi.updateParameter(parameter.key, value))
  }

  return <DashboardShell title="Centro de operaciones" subtitle="Panel administrador">
    <NotificationCenter />
    <UserProfileEditor />
    {summary.data && <section className="mb-6 grid gap-3 sm:grid-cols-4"><Metric label="Usuarios" value={String(summary.data.users)} /><Metric label="Técnicos pendientes" value={String(summary.data.pendingTechnicians)} /><Metric label="Identidades pendientes" value={String(summary.data.pendingVerifications)} /><Metric label="Pagos" value={String(summary.data.payments)} /></section>}
    {error && <p className="mb-4 text-red-400">{error}</p>}
    <SystemParametersPanel items={parameters.data ?? []} onSave={updateParameter} />
    <TechnicianLocationsPanel items={locations.data ?? []} />
    <VerifierManager />
    <VerificationQueue />
    {finances.data && <><FinancialSummaryCard title="Pagos y comisiones" summary={finances.data} /><FinancialList title="Movimientos de la plataforma" items={finances.data.payments} amount={(item) => item.platformFee} empty="Aún no hay pagos registrados." /></>}
    <div className="mt-8 grid gap-8 lg:grid-cols-2"><section><h2 className="mb-4 text-xl font-bold">Técnicos pendientes ({pending.data?.length ?? 0})</h2><div className="space-y-4">{pending.data?.length === 0 && <p className="text-slate-400">No hay perfiles pendientes.</p>}{pending.data?.map((profile) => <article key={profile.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h3 className="text-lg font-bold">{profile.fullName}</h3><p className="text-brand-400">{profile.categories.map((item) => item.name).join(', ')}</p><VerificationBadge value={profile.verificationStatus} /><p className="mt-3 text-sm text-slate-400">{profile.workExperienceDescription}</p><div className="mt-3 flex gap-2"><button onClick={() => void openEvidence(profile.documentPhotoUrl)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Ver documento</button>{profile.certificatePhotoUrl && <button onClick={() => void openEvidence(profile.certificatePhotoUrl)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Ver certificado</button>}</div><div className="mt-5 flex gap-3"><button disabled={profile.verificationStatus !== 'VERIFIED'} onClick={() => action.mutate(() => adminApi.reviewTechnician(profile.id, 'approve'))} className="rounded-lg bg-emerald-500 px-4 py-2 font-bold text-slate-950 disabled:opacity-40">Aprobar</button><button onClick={() => action.mutate(() => adminApi.reviewTechnician(profile.id, 'reject'))} className="rounded-lg border border-red-500 px-4 py-2 text-red-300">Rechazar</button></div></article>)}</div></section>
      <section><h2 className="mb-4 text-xl font-bold">Categorías</h2><form onSubmit={createCategory} className="mb-4 space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-5"><input placeholder="Nombre" value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} required /><input placeholder="Descripción" value={categoryForm.description} onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })} /><button className="rounded-lg bg-brand-500 px-4 py-2 font-bold text-slate-950">Crear</button></form><div className="space-y-2">{categories.data?.map((category) => <div key={category.id} className="rounded-xl border border-slate-800 p-4"><div className="flex items-center justify-between"><div><strong>{category.name}</strong><p className="text-xs text-slate-500">{category.active ? 'Activa' : 'Inactiva'}</p></div><div className="flex gap-2"><button onClick={() => editCategory(category)} className="rounded-lg border border-slate-700 px-3 py-2">Editar</button><button onClick={() => action.mutate(() => adminApi.updateCategory({ ...category, active: !category.active }))} className="rounded-lg border border-slate-700 px-3 py-2">{category.active ? 'Desactivar' : 'Activar'}</button><button onClick={() => deleteCategory(category)} className="rounded-lg border border-red-500/50 px-3 py-2 text-red-300">Eliminar</button></div></div></div>)}</div></section></div>
  </DashboardShell>
}
