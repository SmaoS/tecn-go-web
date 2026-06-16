import { useState } from 'react'
import { queryKeys } from '../../../lib/queryClient'
import { QueryState } from '../../shared/components/QueryState'
import { useAdminAction, useAdminTechnicianWallets } from '../hooks'
import { adminApi } from '../api'

function money(value: number) {
  return `$${value.toLocaleString()}`
}

export function AdminTechnicianWalletsPage() {
  const wallets = useAdminTechnicianWallets()
  const action = useAdminAction(queryKeys.adminTechnicianWallets)
  const [selected, setSelected] = useState<string>()
  const [amount, setAmount] = useState('')
  const [comment, setComment] = useState('')

  return <section>
    <h2 className="mb-4 text-2xl font-bold">Saldos de técnicos</h2>
    <QueryState pending={wallets.isPending} error={wallets.error} empty={wallets.data?.length === 0}>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400">
                <th className="p-4">Técnico</th>
                <th>Saldo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {wallets.data?.map((wallet) => <tr key={wallet.technicianId} className="border-t border-slate-800">
                <td className="p-4">
                  <strong>{wallet.technicianName}</strong>
                  <p className="text-xs text-slate-500">{wallet.technicianEmail}</p>
                </td>
                <td className={wallet.balance < 0 ? 'font-bold text-red-300' : 'font-bold text-brand-300'}>{money(wallet.balance)}</td>
                <td>{wallet.rechargeEnabled ? 'Activo' : 'Recargas apagadas'}</td>
                <td><button className="text-brand-300" onClick={() => setSelected(wallet.technicianId)}>Ajustar</button></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <form className="rounded-2xl border border-slate-800 bg-slate-900 p-5" onSubmit={(event) => {
          event.preventDefault()
          if (!selected) return
          action.mutate(() => adminApi.adjustTechnicianWallet(selected, Number(amount), comment), {
            onSuccess: () => {
              setAmount('')
              setComment('')
              setSelected(undefined)
            },
          })
        }}>
          <h3 className="text-xl font-bold">Ajuste manual</h3>
          <p className="mt-2 text-sm text-slate-400">Usa valores positivos para abonar y negativos para descontar.</p>
          <label className="mt-4 block text-sm font-semibold">Técnico</label>
          <select className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" value={selected ?? ''} onChange={(event) => setSelected(event.target.value)}>
            <option value="">Seleccionar técnico</option>
            {wallets.data?.map((wallet) => <option key={wallet.technicianId} value={wallet.technicianId}>{wallet.technicianName}</option>)}
          </select>
          <label className="mt-4 block text-sm font-semibold">Valor</label>
          <input className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Ej: 10000 o -5000" />
          <label className="mt-4 block text-sm font-semibold">Comentario</label>
          <textarea className="mt-1 min-h-28 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" value={comment} onChange={(event) => setComment(event.target.value)} />
          {action.error && <p className="mt-3 text-sm text-red-300">{action.error.message}</p>}
          <button className="mt-4 w-full rounded-xl bg-brand-500 px-4 py-3 font-bold text-slate-950 disabled:opacity-50" disabled={!selected || !amount || !comment || action.isPending}>
            {action.isPending ? 'Guardando...' : 'Guardar ajuste'}
          </button>
        </form>
      </div>
    </QueryState>
  </section>
}
