import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import type { ReferralCode } from '../../../types'
import { QueryState } from '../../shared/components/QueryState'
import { adminApi } from '../api'
import { useAdminParameters } from '../hooks'

export function AdminReferralsPage() {
  const client = useQueryClient()
  const codes = useQuery({ queryKey: ['admin', 'referrals'], queryFn: adminApi.referralCodes })
  const parameters = useAdminParameters()
  const programEnabled = parameters.data?.find((item) => item.key === 'REFERRAL_PROGRAM_ENABLED')?.value === 'true'
  const [selected, setSelected] = useState<ReferralCode>()
  const registrations = useQuery({ queryKey: ['admin', 'referrals', selected?.technicianId, 'registrations'], queryFn: () => adminApi.referralRegistrations(selected!.technicianId), enabled: Boolean(selected) })
  const rewards = useQuery({ queryKey: ['admin', 'referrals', selected?.technicianId, 'rewards'], queryFn: () => adminApi.referralRewards(selected!.technicianId), enabled: Boolean(selected) })
  const action = useMutation({ mutationFn: (run: () => Promise<unknown>) => run(), onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'referrals'] }) })
  return <section><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">Referidos</h2><span className={`rounded-full px-3 py-1 text-sm font-bold ${programEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{programEnabled ? 'Programa activo' : 'Programa inactivo'}</span></div>
    <QueryState pending={codes.isPending} error={codes.error}><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-slate-400"><th>Técnico</th><th>Código</th><th>Registrados</th><th>Calificados</th><th>Disponibles</th><th>Usados</th><th>Acciones</th></tr></thead><tbody>{codes.data?.map((item) => <tr key={item.id} className="border-t border-slate-800"><td className="py-3">{item.technicianName}</td><td>{item.code}</td><td>{item.registered}</td><td>{item.qualified}</td><td>{item.availableRewards}</td><td>{item.usedRewards}</td><td className="flex flex-wrap gap-2 py-2"><button onClick={() => setSelected(item)} className="text-brand-300">Ver historial</button><button onClick={() => action.mutate(() => adminApi.setReferralActive(item.id, !item.active))} className="text-amber-300">{item.active ? 'Desactivar' : 'Activar'}</button><button onClick={() => window.confirm('¿Regenerar este código? El código anterior dejará de funcionar.') && action.mutate(() => adminApi.regenerateReferral(item.id))} className="text-red-300">Regenerar</button></td></tr>)}</tbody></table></div></QueryState>
    {selected && <div className="mt-6 grid gap-4 lg:grid-cols-2"><article className="rounded-xl bg-slate-900 p-4"><h3 className="font-bold">Referidos de {selected.technicianName}</h3>{registrations.data?.map((item) => <p key={item.id} className="border-t border-slate-800 py-2 text-sm">{item.referredUserName} · {item.referredUserRole} · {item.status}</p>)}</article><article className="rounded-xl bg-slate-900 p-4"><h3 className="font-bold">Beneficios</h3>{rewards.data?.map((item) => <p key={item.id} className="border-t border-slate-800 py-2 text-sm">{item.rewardType} · {item.status}</p>)}</article></div>}
  </section>
}
