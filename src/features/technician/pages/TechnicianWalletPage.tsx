import { useState } from 'react'
import { QueryState } from '../../shared/components/QueryState'
import { useRechargeWallet, useTechnicianWallet } from '../hooks'

function money(value: number) {
  return `$${value.toLocaleString()}`
}

export function TechnicianWalletPage() {
  const { wallet, transactions } = useTechnicianWallet()
  const recharge = useRechargeWallet()
  const [amount, setAmount] = useState('10000')

  return <section>
    <h2 className="mb-4 text-2xl font-bold">Mi saldo</h2>
    <QueryState pending={wallet.isPending || transactions.isPending} error={wallet.error ?? transactions.error}>
      {wallet.data && <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Saldo disponible</p>
          <strong className={wallet.data.balance < 0 ? 'mt-2 block text-4xl text-red-300' : 'mt-2 block text-4xl text-brand-300'}>
            {money(wallet.data.balance)}
          </strong>
          <p className="mt-3 text-sm text-slate-400">
            {wallet.data.rechargeEnabled
              ? 'Tus comisiones se descuentan automáticamente cuando recibes pagos.'
              : 'Las recargas están deshabilitadas por ahora. Puedes seguir usando TecnGo sin recargar saldo.'}
          </p>
          {wallet.data.blocked && <p className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
            Debes recargar para volver a cotizar servicios.
          </p>}
          <form className="mt-5 space-y-3" onSubmit={(event) => {
            event.preventDefault()
            recharge.mutate(Number(amount))
          }}>
            <label className="block text-sm font-semibold">Valor a recargar</label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              inputMode="numeric"
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(/\D/g, ''))}
              disabled={!wallet.data.rechargeEnabled || recharge.isPending}
            />
            <p className="text-xs text-slate-500">Mínimo {money(wallet.data.minRechargeAmount)} · Máximo {money(wallet.data.maxRechargeAmount)}</p>
            {recharge.error && <p className="text-sm text-red-300">{recharge.error.message}</p>}
            <button
              className="w-full rounded-xl bg-brand-500 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!wallet.data.rechargeEnabled || recharge.isPending || Number(amount) <= 0}
            >
              {recharge.isPending ? 'Creando recarga...' : 'Recargar con Wompi'}
            </button>
          </form>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="text-xl font-bold">Movimientos</h3>
          {(transactions.data ?? []).length === 0
            ? <p className="mt-3 text-slate-400">Aún no tienes movimientos de saldo.</p>
            : <div className="mt-4 space-y-2">
              {transactions.data?.map((item) => <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <div>
                  <strong>{transactionLabel(item.type)}</strong>
                  {item.description && <p className="text-sm text-slate-400">{item.description}</p>}
                  <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <strong className={item.amount < 0 ? 'text-red-300' : 'text-brand-300'}>{money(item.amount)}</strong>
              </div>)}
            </div>}
        </article>
      </div>}
    </QueryState>
  </section>
}

function transactionLabel(type: string) {
  const labels: Record<string, string> = {
    RECHARGE_PENDING: 'Recarga pendiente',
    RECHARGE_APPROVED: 'Recarga aprobada',
    RECHARGE_REJECTED: 'Recarga rechazada',
    COMMISSION_DEBIT: 'Comisión descontada',
    COMMISSION_REFUND: 'Reembolso de comisión',
    ADMIN_ADJUSTMENT: 'Ajuste administrativo',
  }
  return labels[type] ?? type
}
