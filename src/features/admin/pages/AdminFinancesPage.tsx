import { FinancialList, FinancialSummaryCard } from '../../payments/components'
import { QueryState } from '../../shared/components/QueryState'
import { useAdminFinances } from '../hooks'

export function AdminFinancesPage() {
  const finances = useAdminFinances()
  return <section><h2 className="mb-4 text-2xl font-bold">Pagos y comisiones</h2><QueryState pending={finances.isPending} error={finances.error}>
    {finances.data && <><FinancialSummaryCard title="" summary={finances.data} /><FinancialList title="Movimientos de la plataforma" items={finances.data.payments} amount={(item) => item.platformFee} empty="Aún no hay pagos registrados." /></>}
  </QueryState></section>
}
