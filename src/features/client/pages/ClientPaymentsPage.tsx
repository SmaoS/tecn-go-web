import { FinancialList } from '../../payments/components'
import { QueryState } from '../../shared/components/QueryState'
import { useClientPayments } from '../hooks'

export function ClientPaymentsPage() {
  const payments = useClientPayments()
  return <section><h2 className="mb-4 text-2xl font-bold">Historial de pagos</h2>
    <QueryState pending={payments.isPending} error={payments.error}>
      <FinancialList title="" items={payments.data ?? []} amount={(item) => item.amount} empty="Aún no tienes pagos registrados." />
    </QueryState>
  </section>
}
