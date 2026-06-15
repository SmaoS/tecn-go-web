import { useEffect, useState } from 'react'
import type { SystemParameter, TechnicianLocation } from '../../types'

export function SystemParametersPanel({ items, onSave }: {
  items: SystemParameter[]
  onSave: (item: SystemParameter, value: string) => Promise<unknown>
}) {
  const [values, setValues] = useState<Record<string, string>>({})
  useEffect(() => setValues(Object.fromEntries(items.map((item) => [item.key, item.value]))), [items])
  return <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5"><h2 className="text-xl font-bold">Parámetros del sistema</h2><p className="mt-1 text-sm text-slate-400">Los cambios aplican a operaciones futuras.</p><div className="mt-4 grid gap-3 md:grid-cols-2">{items.map((item) => <label key={item.key} className="rounded-xl bg-slate-950/50 p-3 text-sm"><strong>{item.key}</strong><span className="mt-1 block text-xs text-slate-500">{item.description}</span><div className="mt-2 flex gap-2"><input type={item.type === 'STRING' ? 'text' : 'number'} min="0" value={values[item.key] ?? item.value} onChange={(event) => setValues({ ...values, [item.key]: event.target.value })} /><button onClick={() => void onSave(item, values[item.key] ?? item.value)} className="rounded-lg bg-brand-500 px-3 font-bold text-slate-950">Guardar</button></div></label>)}</div></section>
}

export function TechnicianLocationsPanel({ items }: { items: TechnicianLocation[] }) {
  return <section className="mb-8"><h2 className="mb-3 text-xl font-bold">Ubicación de técnicos</h2><div className="grid gap-3 md:grid-cols-2">{items.length === 0 && <p className="text-slate-400">Aún no hay ubicaciones reportadas.</p>}{items.map((item) => <article key={item.technicianId} className="rounded-xl border border-slate-800 bg-slate-900 p-4"><div className="flex justify-between"><strong>{item.technicianName}</strong><span className={item.online ? 'text-emerald-400' : 'text-slate-500'}>{item.online ? 'Online' : 'Offline'}</span></div><p className="mt-2 text-sm text-slate-400">Ubicación GPS protegida y reportada</p><time className="text-xs text-slate-500">{new Date(item.updatedAt).toLocaleString()}</time></article>)}</div></section>
}
