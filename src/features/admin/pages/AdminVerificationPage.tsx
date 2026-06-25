import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { PrivateImage } from '../../../components/PrivateImage'
import { queryKeys } from '../../../lib/queryClient'
import { VerificationBadge } from '../../profile/components'
import { QueryState } from '../../shared/components/QueryState'
import { VerifierManager } from '../../verification/components'
import { adminApi } from '../api'
import { usePendingTechnicians } from '../hooks'

export function AdminVerificationPage() {
  const client = useQueryClient()
  const [error, setError] = useState('')
  const [large, setLarge] = useState<{ url: string; title: string } | null>(null)
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
    <VerifierManager />
    <h3 className="mb-4 text-xl font-bold">Técnicos pendientes ({pending.data?.length ?? 0})</h3>
    {(error || review.error) && <p className="mb-4 text-red-300">{error || 'No fue posible revisar el técnico.'}</p>}
    <QueryState pending={pending.isPending} error={pending.error} empty={pending.data?.length === 0}>
      <div className="grid gap-4 md:grid-cols-2">{pending.data?.map((profile) => <article key={profile.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h3 className="text-lg font-bold">{profile.fullName}</h3><p className="text-brand-400">{profile.categories.map((item) => item.name).join(', ')}</p><VerificationBadge value={profile.verificationStatus} /><p className="mt-3 text-sm text-slate-400">{profile.workExperienceDescription}</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{profile.documentPhotoUrl && <EvidencePreview title="Documento" url={profile.documentPhotoUrl} onOpen={evidence} onLarge={(url) => setLarge({ url, title: 'Documento' })} />}{profile.certificatePhotoUrl && <EvidencePreview title="Certificado de estudio" url={profile.certificatePhotoUrl} onOpen={evidence} onLarge={(url) => setLarge({ url, title: 'Certificado de estudio' })} />}</div><div className="mt-5 flex gap-3"><button disabled={profile.verificationStatus !== 'VERIFIED'} onClick={() => review.mutate({ id: profile.id, decision: 'approve' })} className="rounded-lg bg-emerald-500 px-4 py-2 font-bold text-slate-950 disabled:opacity-40">Aprobar</button><button onClick={() => review.mutate({ id: profile.id, decision: 'reject' })} className="rounded-lg border border-red-500 px-4 py-2 text-red-300">Rechazar</button></div></article>)}</div>
    </QueryState>
    {large && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4" onClick={() => setLarge(null)}>
      <div className="max-h-[90vh] max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 p-4" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><strong>{large.title}</strong><button onClick={() => setLarge(null)} className="text-sm text-brand-300">Cerrar</button></div>
        <PrivateImage src={large.url} alt={large.title} className="max-h-[75vh] max-w-full rounded-xl object-contain" />
      </div>
    </div>}
  </section>
}

function EvidencePreview({ title, url, onOpen, onLarge }: {
  title: string
  url: string
  onOpen: (url?: string) => Promise<void>
  onLarge: (url: string) => void
}) {
  return <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
    <button type="button" onClick={() => onLarge(url)} className="block w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
      <PrivateImage src={url} alt={title} className="h-28 w-full object-cover" />
    </button>
    <div className="mt-2 flex items-center justify-between gap-2"><span className="text-sm font-bold">{title}</span><button type="button" onClick={() => void onOpen(url)} className="text-xs text-brand-300">Abrir</button></div>
  </div>
}
