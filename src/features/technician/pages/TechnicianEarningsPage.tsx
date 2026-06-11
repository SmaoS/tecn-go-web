import { FinancialList, FinancialSummaryCard } from '../../payments/components'
import { QueryState } from '../../shared/components/QueryState'
import { useTechnicianEarnings } from '../hooks'

export function TechnicianEarningsPage() {
  const earnings = useTechnicianEarnings()
  return <section><h2 className="mb-4 text-2xl font-bold">Mis ganancias</h2><QueryState pending={earnings.isPending} error={earnings.error}>
    {earnings.data && <><FinancialSummaryCard title="" summary={earnings.data} /><FinancialList title="Historial de ganancias" items={earnings.data.payments} amount={(item) => item.technicianAmount} empty="Aún no tienes ganancias registradas." /></>}
  </QueryState></section>
}
