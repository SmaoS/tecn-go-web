import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'
import { PrivateImage } from '../../../components/PrivateImage'
import { queryKeys } from '../../../lib/queryClient'
import { ImageGallery, Reputation } from '../../service-requests/components'
import { QueryState } from '../../shared/components/QueryState'
import { technicianApi } from '../api'
import { useAvailableServices, useTechnicianProfile } from '../hooks'

export function AvailableRequestsPage() {
  const client = useQueryClient()
  const [radiusKm, setRadiusKm] = useState('10')
  const [quotes, setQuotes] = useState<Record<string, string>>({})
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})
  const profile = useTechnicianProfile()
  const requests = useAvailableServices(radiusKm, profile.data?.status === 'APPROVED')
  const quote = useMutation({
    mutationFn: (id: string) => technicianApi.quote(id, Number(quotes[id]), descriptions[id] || undefined),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.availableRequestsRoot }),
  })
  const quoteError = quote.error && axios.isAxiosError(quote.error) && quote.error.response?.status === 409
    ? 'Ya tienes una cotización pendiente para este servicio. Espera respuesta o expiración.'
    : quote.error ? 'No fue posible enviar la cotización.' : ''

  return <section><div className="mb-4 flex items-center gap-3"><h2 className="text-2xl font-bold">Solicitudes cercanas</h2><label>Radio (km)</label><input className="max-w-28" type="number" min="1" max="100" value={radiusKm} onChange={(event) => setRadiusKm(event.target.value)} /></div>
    {profile.data && profile.data.status !== 'APPROVED' && <p className="text-amber-300">Tu perfil debe estar aprobado para consultar solicitudes.</p>}
    {quoteError && <p className="mb-4 text-red-300">{quoteError}</p>}
    <QueryState pending={profile.isPending || requests.isPending} error={profile.error ?? requests.error} empty={requests.data?.length === 0}>
      <div className="space-y-3">{requests.data?.map((item) => <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        {item.firstServiceImageUrl && <PrivateImage src={item.firstServiceImageUrl} alt="" className="mb-3 h-40 w-full rounded-xl object-cover" />}
        <strong>{item.categoryName}</strong><Reputation photo={item.clientProfilePhotoUrl} name={item.clientName} rating={item.clientAverageRating} services={item.clientPaidServicesCount} />
        <p className="mt-2 text-sm text-slate-400">{item.description}</p>{item.images?.length > 0 && <ImageGallery urls={item.images.map((image) => image.imageUrl)} />}
        {item.estimatedPrice != null && <p className="mt-2 font-bold text-brand-400">Estimado del cliente: ${item.estimatedPrice.toLocaleString()}</p>}
        <p className="mt-2 text-xs text-slate-500">{item.address} · {item.distanceKm?.toFixed(2)} km</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_2fr_auto]"><input type="number" min="1" placeholder="Tu cotización" value={quotes[item.id] ?? ''} onChange={(event) => setQuotes({ ...quotes, [item.id]: event.target.value })} /><input placeholder="Descripción de la oferta (opcional)" value={descriptions[item.id] ?? ''} onChange={(event) => setDescriptions({ ...descriptions, [item.id]: event.target.value })} /><button disabled={!quotes[item.id] || quote.isPending} onClick={() => quote.mutate(item.id)} className="rounded-lg bg-brand-500 px-3 py-2 font-bold text-slate-950 disabled:opacity-50">Cotizar</button></div>
      </article>)}</div>
    </QueryState>
  </section>
}
