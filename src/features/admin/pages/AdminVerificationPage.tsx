import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { queryKeys } from '../../../lib/queryClient'
import { VerificationBadge } from '../../profile/components'
import { QueryState } from '../../shared/components/QueryState'
import { VerificationQueue, VerifierManager } from '../../verification/components'
import { adminApi } from '../api'
import { usePendingTechnicians } from '../hooks'

export function AdminVerificationPage() {
  const client = useQueryClient()
  const [error, setError] = useState('')
  const pending = usePendingTechnicians()
  const review = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'approve' | 'reject' }) =>
      adminApi.reviewTechnician(id, decision),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.adminPendingTechnicians }),
  })
  async function evidence(url?: string) {
    if (!url) return
    try { window.open(URL.createObjectURL(await adminApi.evidence(url)), '_blank', 'noopener,noreferrer') }
    catch { setError('No fue posible abrir la evidencia.') }
  }
  return <section><h2 className="mb-4 text-2xl font-bold">Verificaciones</h2>
    <VerifierManager /><VerificationQueue />
    <h3 className="mb-4 text-xl font-bold">Técnicos pendientes ({pending.data?.length ?? 0})</h3>
    {(error || review.error) && <p className="mb-4 text-red-300">{error || 'No fue posible revisar el técnico.'}</p>}
    <QueryState pending={pending.isPending} error={pending.error} empty={pending.data?.length === 0}>
      <div className="grid gap-4 md:grid-cols-2">{pending.data?.map((profile) => <article key={profile.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h3 className="text-lg font-bold">{profile.fullName}</h3><p className="text-brand-400">{profile.categories.map((item) => item.name).join(', ')}</p><VerificationBadge value={profile.verificationStatus} /><p className="mt-3 text-sm text-slate-400">{profile.workExperienceDescription}</p><div className="mt-3 flex gap-2"><button onClick={() => void evidence(profile.documentPhotoUrl)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Ver documento</button>{profile.certificatePhotoUrl && <button onClick={() => void evidence(profile.certificatePhotoUrl)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Ver certificado</button>}</div><div className="mt-5 flex gap-3"><button disabled={profile.verificationStatus !== 'VERIFIED'} onClick={() => review.mutate({ id: profile.id, decision: 'approve' })} className="rounded-lg bg-emerald-500 px-4 py-2 font-bold text-slate-950 disabled:opacity-40">Aprobar</button><button onClick={() => review.mutate({ id: profile.id, decision: 'reject' })} className="rounded-lg border border-red-500 px-4 py-2 text-red-300">Rechazar</button></div></article>)}</div>
    </QueryState>
  </section>
}
