import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { complianceApi } from '../../compliance/api'
import type { ComplianceIncident, DataRequest, IncidentSeverity, RetentionPolicy } from '../../compliance/types'

export function AdminCompliancePage() {
  const client = useQueryClient()
  const requests = useQuery({ queryKey: ['admin', 'compliance', 'requests'], queryFn: complianceApi.dataRequests })
  const exportRequests = useQuery({
    queryKey: ['admin', 'compliance', 'export-requests'],
    queryFn: () => complianceApi.adminExportRequests('PENDING'),
  })
  const policies = useQuery({ queryKey: ['admin', 'compliance', 'policies'], queryFn: complianceApi.policies })
  const incidents = useQuery({ queryKey: ['admin', 'compliance', 'incidents'], queryFn: complianceApi.incidents })
  const audits = useQuery({ queryKey: ['admin', 'compliance', 'audits'], queryFn: complianceApi.audits })
  const [draft, setDraft] = useState({ title: '', description: '', severity: 'MEDIUM' as IncidentSeverity })
  const refresh = () => client.invalidateQueries({ queryKey: ['admin', 'compliance'] })
  const action = useMutation({ mutationFn: (run: () => Promise<unknown>) => run(), onSuccess: refresh })

  return <section className="space-y-8">
    <div><h2 className="text-2xl font-bold">Cumplimiento y privacidad</h2>
      <p className="text-sm text-slate-400">Retención, derechos del titular, incidentes y accesos sensibles.</p>
    </div>

    <Panel title="Solicitudes de datos">
      {requests.data?.filter((item) => item.type !== 'EXPORT').map((item) => <article key={item.id} className="rounded-xl border border-slate-800 p-4">
        <strong>{item.userName} · {item.type}</strong>
        <p className="text-sm text-slate-400">{item.status} · {new Date(item.requestedAt).toLocaleString()}</p>
        {item.reason && <p className="mt-2 text-sm">{item.reason}</p>}
        {item.type === 'ANONYMIZATION' && item.status === 'PENDING' && <div className="mt-3 flex gap-2">
          <button className="rounded bg-red-600 px-3 py-2 font-bold text-white" onClick={() => {
            if (window.confirm('Esta acción anonimiza la cuenta de forma irreversible. ¿Continuar?')) {
              action.mutate(() => complianceApi.approveAnonymization(item.id))
            }
          }}>Aprobar anonimización</button>
          <button className="rounded border border-slate-600 px-3 py-2" onClick={() => {
            const reason = window.prompt('Motivo del rechazo')
            if (reason) action.mutate(() => complianceApi.rejectRequest(item.id, reason))
          }}>Rechazar</button>
        </div>}
      </article>)}
    </Panel>

    <Panel title="Solicitudes de exportación de datos">
      {exportRequests.data?.length === 0 && <p className="text-sm text-slate-400">No hay solicitudes pendientes.</p>}
      {exportRequests.data?.map((item) => <ExportRequest key={item.id} item={item}
        approve={() => action.mutate(() => complianceApi.approveExportRequest(item.id))}
        reject={(reason) => action.mutate(() => complianceApi.rejectExportRequest(item.id, reason))} />)}
    </Panel>

    <Panel title="Políticas de retención">
      {policies.data?.map((item) => <Policy key={item.id} item={item}
        save={(value) => action.mutate(() => complianceApi.updatePolicy(value))} />)}
      <button className="rounded border border-brand-500 px-3 py-2 text-brand-300"
        onClick={() => action.mutate(complianceApi.runRetention)}>Ejecutar retención ahora</button>
    </Panel>

    <Panel title="Incidentes">
      <div className="grid gap-2 rounded-xl border border-slate-800 p-4 md:grid-cols-2">
        <input placeholder="Título" value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
        <select value={draft.severity}
          onChange={(event) => setDraft({ ...draft, severity: event.target.value as IncidentSeverity })}>
          <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option>
        </select>
        <textarea className="md:col-span-2" placeholder="Descripción" value={draft.description}
          onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
        <button className="rounded bg-brand-500 px-3 py-2 font-bold text-slate-950"
          disabled={!draft.title || !draft.description}
          onClick={() => action.mutate(async () => {
            await complianceApi.createIncident(draft)
            setDraft({ title: '', description: '', severity: 'MEDIUM' })
          })}>Registrar incidente</button>
      </div>
      {incidents.data?.map((item) => <Incident key={item.id} item={item}
        update={(status, summary) => action.mutate(() =>
          complianceApi.updateIncident(item.id, status, item.severity, summary))} />)}
    </Panel>

    <Panel title="Auditoría de accesos">
      <div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead><tr className="text-slate-400"><th>Fecha</th><th>Acción</th><th>Recurso</th><th>Resultado</th><th>Correlación</th></tr></thead>
        <tbody>{audits.data?.map((item) => <tr key={item.id} className="border-t border-slate-800">
          <td className="py-2">{new Date(item.createdAt).toLocaleString()}</td>
          <td>{item.action}</td><td>{item.resourceType}</td><td>{item.outcome}</td>
          <td className="font-mono text-xs">{item.correlationId ?? '-'}</td>
        </tr>)}</tbody>
      </table></div>
    </Panel>
  </section>
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section><h3 className="mb-3 text-lg font-bold">{title}</h3><div className="space-y-3">{children}</div></section>
}

function ExportRequest({ item, approve, reject }: {
  item: DataRequest
  approve: () => void
  reject: (reason: string) => void
}) {
  return <article className="rounded-xl border border-slate-800 p-4">
    <strong>{item.userName}</strong>
    <p className="text-sm text-slate-400">
      {item.status} · solicitada el {new Date(item.requestedAt).toLocaleString()}
    </p>
    <p className="mt-2 text-sm text-slate-300">
      Al aprobar se genera un ZIP plano y se envía al correo registrado del usuario.
    </p>
    <div className="mt-3 flex flex-wrap gap-2">
      <button className="rounded bg-brand-500 px-3 py-2 font-bold text-slate-950"
        onClick={approve}>Aprobar y enviar</button>
      <button className="rounded border border-red-500 px-3 py-2 text-red-300" onClick={() => {
        const reason = window.prompt('Motivo del rechazo')
        if (reason?.trim()) reject(reason.trim())
      }}>Rechazar</button>
    </div>
  </article>
}

function Policy({ item, save }: { item: RetentionPolicy; save: (item: RetentionPolicy) => void }) {
  const [value, setValue] = useState(item)
  return <article className="grid gap-2 rounded-xl border border-slate-800 p-4 md:grid-cols-[1fr_8rem_auto]">
    <div><strong>{value.dataCategory}</strong>
      <input className="mt-2 w-full" value={value.legalBasis}
        onChange={(event) => setValue({ ...value, legalBasis: event.target.value })} /></div>
    <input type="number" min="1" value={value.retentionDays}
      onChange={(event) => setValue({ ...value, retentionDays: Number(event.target.value) })} />
    <label className="text-sm"><input type="checkbox" checked={value.automaticDeletion}
      onChange={(event) => setValue({ ...value, automaticDeletion: event.target.checked })} /> Automática</label>
    <button className="rounded border border-brand-500 px-3 py-2 text-brand-300 md:col-start-3"
      onClick={() => save(value)}>Guardar</button>
  </article>
}

function Incident({ item, update }: {
  item: ComplianceIncident
  update: (status: 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED', summary?: string) => void
}) {
  return <article className="rounded-xl border border-slate-800 p-4">
    <strong>{item.title} · {item.severity}</strong>
    <p className="text-sm text-slate-400">{item.status} · {new Date(item.detectedAt).toLocaleString()}</p>
    <p className="mt-2 text-sm">{item.description}</p>
    {item.status !== 'RESOLVED' && <div className="mt-3 flex flex-wrap gap-2">
      <button className="rounded border border-slate-600 px-3 py-2" onClick={() => update('INVESTIGATING')}>Investigar</button>
      <button className="rounded border border-amber-500 px-3 py-2" onClick={() => update('CONTAINED')}>Contenido</button>
      <button className="rounded border border-emerald-500 px-3 py-2" onClick={() => {
        const summary = window.prompt('Resumen de resolución')
        if (summary) update('RESOLVED', summary)
      }}>Resolver</button>
    </div>}
  </article>
}
