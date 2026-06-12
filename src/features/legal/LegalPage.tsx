import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { legalApi } from './api'

export function LegalPage() {
  const client = useQueryClient()
  const documents = useQuery({ queryKey: ['legal', 'active'], queryFn: legalApi.active })
  const accept = useMutation({ mutationFn: legalApi.accept, onSuccess: () => void client.invalidateQueries({ queryKey: ['legal'] }) })
  return <section><h2 className="mb-4 text-2xl font-bold">Seguridad, términos y tratamiento de datos</h2>
    <div className="space-y-3">{documents.data?.map((item) => <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex justify-between gap-4"><strong>{item.title}</strong><span className="text-xs text-slate-500">v{item.version}</span></div>
      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{item.content}</p>
      <button disabled={item.accepted || accept.isPending} onClick={() => accept.mutate(item.id)} className="mt-4 rounded-lg bg-brand-500 px-3 py-2 text-sm font-bold text-slate-950">{item.accepted ? 'Aceptado' : 'Aceptar documento'}</button>
    </article>)}</div>
  </section>
}
