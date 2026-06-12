import { useState } from 'react'
import { QueryState } from '../../shared/components/QueryState'
import { useTechnicianReferrals } from '../hooks'

export function TechnicianReferralsPage() {
  const { code, referrals, rewards } = useTechnicianReferrals()
  const [copied, setCopied] = useState(false)
  const shareUrl = code.data ? `https://tecn-go.com/register?ref=${code.data.code}` : ''
  async function copy() {
    if (!code.data) return
    await navigator.clipboard.writeText(code.data.code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }
  return <section><h2 className="mb-2 text-2xl font-bold">Invita y gana</h2>
    <p className="mb-5 text-slate-400">Invita clientes o técnicos a TecnGo. Si se registran con tu código y completan un servicio con calificación de 5 estrellas, ganas un servicio sin comisión.</p>
    <QueryState pending={code.isPending || referrals.isPending || rewards.isPending} error={code.error ?? referrals.error ?? rewards.error}>
      {code.data && <div className="grid gap-4">
        <article className="rounded-2xl border border-brand-500/40 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Tu código</p><p className="my-2 text-3xl font-black tracking-wider text-brand-400">{code.data.code}</p>
          <div className="flex flex-wrap gap-2"><button onClick={() => void copy()} className="rounded-lg bg-brand-500 px-4 py-2 font-bold text-slate-950">{copied ? 'Copiado' : 'Copiar código'}</button>
            <a href={`https://wa.me/?text=${encodeURIComponent(`Únete a TecnGo con mi código ${code.data.code}: ${shareUrl}`)}`} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-700 px-4 py-2">Compartir</a></div>
        </article>
        <div className="grid gap-3 sm:grid-cols-4">
          {[['Registrados', code.data.registered], ['Calificados', code.data.qualified], ['Beneficios disponibles', code.data.availableRewards], ['Beneficios usados', code.data.usedRewards]].map(([label, value]) => <article key={String(label)} className="rounded-xl bg-slate-900 p-4"><strong className="text-2xl text-brand-400">{value}</strong><p className="text-sm text-slate-400">{label}</p></article>)}
        </div>
        <article className="rounded-xl bg-slate-900 p-4"><h3 className="mb-3 font-bold">Historial de referidos</h3>{referrals.data?.length === 0 && <p className="text-slate-400">Aún no tienes referidos.</p>}{referrals.data?.map((item) => <p key={item.id} className="border-t border-slate-800 py-2 text-sm">{item.referredUserName} · {item.referredUserRole} · {item.status}</p>)}</article>
        <article className="rounded-xl bg-slate-900 p-4"><h3 className="mb-3 font-bold">Beneficios</h3>{rewards.data?.length === 0 && <p className="text-slate-400">Aún no tienes beneficios.</p>}{rewards.data?.map((item) => <p key={item.id} className="border-t border-slate-800 py-2 text-sm">Servicio sin comisión · {item.status}</p>)}</article>
      </div>}
    </QueryState>
  </section>
}
