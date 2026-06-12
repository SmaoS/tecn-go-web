import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { legalApi } from '../../legal/api'
import { useState } from 'react'
import type { LegalDocument } from '../../legal/types'

export function AdminLegalPage() {
  const client = useQueryClient()
  const documents = useQuery({ queryKey: ['admin', 'legal'], queryFn: legalApi.all })
  const activate = useMutation({ mutationFn: legalApi.activate, onSuccess: () => void client.invalidateQueries({ queryKey: ['admin', 'legal'] }) })
  const [draft, setDraft] = useState<Omit<LegalDocument, 'id' | 'accepted'>>({ code: '', title: '', version: '', roleTarget: 'ALL', content: '', active: false })
  const create = useMutation({ mutationFn: legalApi.create, onSuccess: () => {
    setDraft({ code: '', title: '', version: '', roleTarget: 'ALL', content: '', active: false })
    void client.invalidateQueries({ queryKey: ['admin', 'legal'] })
  } })
  return <section><h2 className="mb-4 text-2xl font-bold">Documentos legales</h2>
    <div className="mb-6 grid gap-2 rounded-xl border border-slate-800 p-4 md:grid-cols-2">
      <input placeholder="Código" value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} />
      <input placeholder="Título" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
      <input placeholder="Versión" value={draft.version} onChange={(event) => setDraft({ ...draft, version: event.target.value })} />
      <select value={draft.roleTarget} onChange={(event) => setDraft({ ...draft, roleTarget: event.target.value as LegalDocument['roleTarget'] })}><option>ALL</option><option>CLIENT</option><option>TECHNICIAN</option></select>
      <textarea className="md:col-span-2" placeholder="Contenido" value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} />
      <label><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} /> Activar al crear</label>
      <button disabled={create.isPending} onClick={() => create.mutate(draft)} className="rounded bg-brand-500 px-3 py-2 font-bold text-slate-950">Crear versión</button>
    </div>
    <div className="space-y-3">{documents.data?.map((item) => <article key={item.id} className="rounded-xl border border-slate-800 p-4">
      <strong>{item.title} · v{item.version}</strong><p className="text-sm text-slate-400">{item.code} · {item.roleTarget}</p><p className="mt-2 text-sm">{item.content}</p>
      {!item.active && <button onClick={() => activate.mutate(item.id)} className="mt-3 rounded bg-brand-500 px-3 py-2 font-bold text-slate-950">Activar versión</button>}
    </article>)}</div>
  </section>
}
