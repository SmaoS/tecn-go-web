import { RequestList } from '../../service-requests/components'
import { QueryState } from '../../shared/components/QueryState'
import { useClientRequestHistory } from '../hooks'

export function ClientRequestHistoryPage() {
  const requests = useClientRequestHistory()
  return <section>
    <h2 className="mb-1 text-2xl font-bold">Historial de solicitudes</h2>
    <p className="mb-4 text-sm text-slate-400">Servicios pagados o cancelados.</p>
    <QueryState pending={requests.isPending} error={requests.error} empty={requests.data?.length === 0}>
      <RequestList title="" items={requests.data ?? []} actionLabel={() => undefined} onAction={() => undefined} />
    </QueryState>
  </section>
}
