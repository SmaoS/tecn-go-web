import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { complianceApi } from './api'
import type { DataRequest } from './types'

export function AdminDataExportRequestsPanel() {
  const client = useQueryClient()
  const exportRequests = useQuery({
    queryKey: ['admin', 'compliance', 'export-requests'],
    queryFn: () => complianceApi.adminExportRequests('PENDING'),
  })
  const action = useMutation({
    mutationFn: (run: () => Promise<unknown>) => run(),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'compliance', 'export-requests'] }),
  })

  return <section>
    <h2 className="mb-4 text-2xl font-bold">Exportación de datos</h2>
    <p className="mb-4 text-sm text-slate-400">
      Aprueba solicitudes para generar el archivo y enviarlo al correo registrado del usuario.
    </p>
    {action.error && <p className="mb-3 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">No fue posible procesar la solicitud.</p>}
    {exportRequests.isPending && <p className="text-sm text-slate-400">Cargando solicitudes...</p>}
    {exportRequests.error && <p className="text-sm text-red-300">No fue posible cargar las solicitudes.</p>}
    {exportRequests.data?.length === 0 && <p className="text-sm text-slate-400">No hay solicitudes pendientes.</p>}
    <div className="space-y-3">
      {exportRequests.data?.map((item) => <ExportRequest key={item.id} item={item}
        approving={action.isPending}
        approve={() => action.mutate(() => complianceApi.approveExportRequest(item.id))}
        reject={(reason) => action.mutate(() => complianceApi.rejectExportRequest(item.id, reason))} />)}
    </div>
  </section>
}

function ExportRequest({ item, approving, approve, reject }: {
  item: DataRequest
  approving: boolean
  approve: () => void
  reject: (reason: string) => void
}) {
  return <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
    <strong>{item.userName}</strong>
    <p className="text-sm text-slate-400">
      {item.status} · solicitada el {new Date(item.requestedAt).toLocaleString()}
    </p>
    <p className="mt-2 text-sm text-slate-300">
      Al aprobar se genera un ZIP plano y se envía automáticamente al correo registrado del usuario.
    </p>
    <div className="mt-3 flex flex-wrap gap-2">
      <button disabled={approving} className="rounded bg-brand-500 px-3 py-2 font-bold text-slate-950 disabled:opacity-50"
        onClick={approve}>Aprobar y enviar</button>
      <button disabled={approving} className="rounded border border-red-500 px-3 py-2 text-red-300 disabled:opacity-50" onClick={() => {
        const reason = window.prompt('Motivo del rechazo')
        if (reason?.trim()) reject(reason.trim())
      }}>Rechazar</button>
    </div>
  </article>
}
