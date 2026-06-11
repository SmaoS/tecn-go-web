import { Metric } from '../../payments/components'
import { QueryState } from '../../shared/components/QueryState'
import { useAdminSummary } from '../hooks'

export function AdminOverviewPage() {
  const summary = useAdminSummary()
  return <section><h2 className="mb-4 text-2xl font-bold">Resumen</h2><QueryState pending={summary.isPending} error={summary.error}>
    {summary.data && <div className="grid gap-3 sm:grid-cols-4"><Metric label="Usuarios" value={String(summary.data.users)} /><Metric label="Técnicos pendientes" value={String(summary.data.pendingTechnicians)} /><Metric label="Identidades pendientes" value={String(summary.data.pendingVerifications)} /><Metric label="Pagos" value={String(summary.data.payments)} /></div>}
  </QueryState></section>
}
