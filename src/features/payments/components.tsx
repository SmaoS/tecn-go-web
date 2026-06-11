import type { FinancialSummary, Payment } from '../../types'

export function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-950/60 p-3"><p className="text-xs text-slate-500">{label}</p><strong>{value}</strong></div>
}

export function FinancialSummaryCard({ title, summary }: { title: string; summary: FinancialSummary }) {
  return <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
    <h2 className="text-xl font-bold">{title}</h2>
    <div className="mt-4 grid gap-3 sm:grid-cols-4">
      <Metric label="Pagos" value={String(summary.paymentCount)} />
      <Metric label="Total cobrado" value={`$${summary.totalAmount.toLocaleString()}`} />
      <Metric label="Comisión" value={`$${summary.totalPlatformFee.toLocaleString()}`} />
      <Metric label="Para técnicos" value={`$${summary.totalTechnicianAmount.toLocaleString()}`} />
    </div>
  </section>
}

export function FinancialList({ title, items, amount, empty }: {
  title: string
  items: Payment[]
  amount: (item: Payment) => number
  empty: string
}) {
  return <section className="mt-6"><h2 className="mb-3 text-xl font-bold">{title}</h2>
    {items.length === 0 ? <p className="text-slate-400">{empty}</p> : <div className="space-y-2">
      {items.map((item) => <article key={item.paymentId} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div><strong>{item.paymentMethod === 'CASH' ? 'Efectivo' : item.paymentMethod}</strong><p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p></div>
        <strong className="text-brand-400">${amount(item).toLocaleString()}</strong>
      </article>)}
    </div>}
  </section>
}
