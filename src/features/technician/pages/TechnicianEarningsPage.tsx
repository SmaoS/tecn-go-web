import { useState } from 'react'
import { FinancialList } from '../../payments/components'
import { QueryState } from '../../shared/components/QueryState'
import { useTechnicianEarnings } from '../hooks'

export function TechnicianEarningsPage() {
  const earnings = useTechnicianEarnings()
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const payments = earnings.data?.payments ?? []
  const periodPayments = payments.filter((payment) => inPeriod(payment.createdAt, period))
  const periodTotal = periodPayments.reduce((total, payment) => total + payment.technicianAmount, 0)
  return <section><h2 className="mb-4 text-2xl font-bold">Mis ganancias</h2><QueryState pending={earnings.isPending} error={earnings.error}>
    {earnings.data && <>
      <div className="mb-4 inline-flex rounded-xl bg-slate-900 p-1">
        <button className={`rounded-lg px-4 py-2 text-sm font-bold ${period === 'week' ? 'bg-brand-500 text-slate-950' : 'text-slate-300'}`} onClick={() => setPeriod('week')}>Semana</button>
        <button className={`rounded-lg px-4 py-2 text-sm font-bold ${period === 'month' ? 'bg-brand-500 text-slate-950' : 'text-slate-300'}`} onClick={() => setPeriod('month')}>Mes</button>
      </div>
      <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">{period === 'week' ? 'Total recibido esta semana' : 'Total recibido este mes'}</p>
        <strong className="mt-2 block text-4xl text-brand-300">${periodTotal.toLocaleString()}</strong>
        <p className="mt-2 text-sm text-slate-500">{periodPayments.length} pagos en el periodo · {earnings.data.paymentCount} pagos históricos</p>
      </section>
      <FinancialList title="Historial de ganancias" items={periodPayments} amount={(item) => item.technicianAmount} empty="Aún no tienes ganancias registradas en este periodo." />
    </>}
  </QueryState></section>
}

function inPeriod(value: string, period: 'week' | 'month') {
  const date = new Date(value)
  const now = new Date()
  if (Number.isNaN(date.getTime())) return false
  if (period === 'month') return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  const start = startOfWeek(now)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  return date >= start && date < end
}

function startOfWeek(value: Date) {
  const start = new Date(value)
  start.setHours(0, 0, 0, 0)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  return start
}
