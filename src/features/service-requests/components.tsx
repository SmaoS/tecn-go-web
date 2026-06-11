import type { RequestStatus, ServiceRequest } from '../../types'
import { assetUrl } from '../../lib/api'
import { statusLabels } from './status'

export function Status({ value }: { value: RequestStatus }) {
  return <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-bold text-brand-400">{statusLabels[value]}</span>
}

const trackingSteps: RequestStatus[] = [
  'QUOTE_PENDING', 'QUOTED', 'QUOTE_ACCEPTED', 'ON_THE_WAY',
  'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'PAID',
]

export function Tracking({ status }: { status: RequestStatus }) {
  if (status === 'CANCELLED') return <p className="mt-3 text-sm text-red-300">Servicio cancelado</p>
  const current = trackingSteps.indexOf(status)
  return <div className="mt-4 flex gap-1">
    {trackingSteps.map((step, index) => <span
      key={step}
      title={statusLabels[step]}
      className={`h-2 flex-1 rounded ${index <= current ? 'bg-brand-500' : 'bg-slate-700'}`}
    />)}
  </div>
}

export function Reputation({ photo, name, rating, services, description }: {
  photo?: string
  name: string
  rating: number
  services: number
  description?: string
}) {
  return <div className="mt-3 flex gap-3 rounded-xl bg-slate-950/50 p-3">
    {photo
      ? <img src={assetUrl(photo)} alt="" className="h-12 w-12 rounded-full object-cover" />
      : <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-800 font-bold">{name.charAt(0)}</div>}
    <div><strong>{name}</strong><p className="text-sm text-brand-400">★ {rating.toFixed(1)} · {services} servicios</p>{description && <p className="text-xs text-slate-500">{description}</p>}</div>
  </div>
}

export function ImageGallery({ urls }: { urls: string[] }) {
  return <div className="mt-3 grid grid-cols-3 gap-2">
    {urls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer">
      <img src={url} alt="Evidencia del servicio" className="h-24 w-full rounded-lg object-cover" />
    </a>)}
  </div>
}

export function RequestList({ title, items, actionLabel, onAction, onChat }: {
  title: string
  items: ServiceRequest[]
  actionLabel: (item: ServiceRequest) => string | undefined
  onAction: (item: ServiceRequest) => void
  onChat?: (item: ServiceRequest) => void
}) {
  return <section><h2 className="mb-4 text-xl font-bold">{title}</h2><div className="space-y-3">
    {items.length === 0 && <p className="text-slate-400">No hay solicitudes.</p>}
    {items.map((item) => <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex justify-between"><strong>{item.categoryName}</strong><Status value={item.status} /></div>
      <p className="mt-2 text-sm text-slate-400">{item.description}</p>
      <p className="mt-2 text-xs text-slate-500">{item.address}</p>
      {item.finalPrice != null && <p className="mt-2 font-bold">${item.finalPrice.toLocaleString()}</p>}
      <Tracking status={item.status} />
      <div className="mt-4 flex gap-2">
        {actionLabel(item) && <button onClick={() => onAction(item)} className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-bold text-slate-950">{actionLabel(item)}</button>}
        {onChat && item.technicianId && <button onClick={() => onChat(item)} className="rounded-lg border border-brand-500/50 px-3 py-2 text-sm text-brand-300">Chat</button>}
      </div>
    </article>)}
  </div></section>
}
