import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { PrivateImage } from '../../../components/PrivateImage'
import { formatCopCurrency } from '../../../lib/format'
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
  const [routeRequestId, setRouteRequestId] = useState<string>()
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>()
  const [locationError, setLocationError] = useState('')
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
  const profile = useTechnicianProfile()
  const requests = useAvailableServices(radiusKm, profile.data?.status === 'APPROVED')
  const quote = useMutation({
    mutationFn: (id: string) => technicianApi.quote(id, Number(quotes[id]), descriptions[id] || undefined),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.availableRequestsRoot }),
  })
  const quoteError = quote.error && axios.isAxiosError(quote.error) && quote.error.response?.status === 409
    ? 'Ya tienes una cotización pendiente para este servicio. Espera respuesta o expiración.'
    : quote.error ? 'No fue posible enviar la cotización.' : ''
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('El navegador no permite consultar tu ubicación.')
      return
    }
    const watch = navigator.geolocation.watchPosition(({ coords }) => {
      setLocation({ latitude: coords.latitude, longitude: coords.longitude })
      setLocationError('')
    }, () => setLocationError('Activa el permiso de ubicación para consultar recorridos.'), {
      enableHighAccuracy: true,
      maximumAge: 10_000,
    })
    return () => navigator.geolocation.clearWatch(watch)
  }, [])

  return <section><div className="mb-4 flex items-center gap-3"><h2 className="text-2xl font-bold">Solicitudes cercanas</h2><label>Radio (km)</label><input className="max-w-28" type="number" min="1" max="100" value={radiusKm} onChange={(event) => setRadiusKm(event.target.value)} /></div>
    {profile.data && profile.data.status !== 'APPROVED' && <p className="text-amber-300">Tu perfil debe estar aprobado para consultar solicitudes.</p>}
    {quoteError && <p className="mb-4 text-red-300">{quoteError}</p>}
    <QueryState pending={profile.isPending || requests.isPending} error={profile.error ?? requests.error} empty={requests.data?.length === 0}>
      <div className="space-y-3">{requests.data?.map((item) => <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        {item.firstServiceImageUrl && <PrivateImage src={item.firstServiceImageUrl} alt="" className="mb-3 h-40 w-full rounded-xl object-cover" />}
        <strong>{item.categoryName}</strong><Reputation photo={item.clientProfilePhotoUrl} name={item.clientName} rating={item.clientAverageRating} services={item.clientPaidServicesCount} />
        <p className="mt-2 text-sm text-slate-400">{item.description}</p>{item.images?.length > 0 && <ImageGallery urls={item.images.map((image) => image.imageUrl)} />}
        {item.estimatedPrice != null && <p className="mt-2 font-bold text-brand-400">Estimado del cliente: {formatCopCurrency(item.estimatedPrice)}</p>}
        <p className="mt-2 text-xs text-slate-500">{item.address} · {item.distanceKm?.toFixed(2)} km</p>
        <button type="button" onClick={() => setRouteRequestId(routeRequestId === item.id ? undefined : item.id)} className="mt-3 rounded-lg border border-brand-500 px-3 py-2 text-sm font-bold text-brand-300">{
          routeRequestId === item.id ? 'Ocultar recorrido' : 'Ver recorrido aproximado'
        }</button>
        {routeRequestId === item.id && <div className="mt-3">
          <p className="mb-2 text-xs text-slate-400">Tu ubicación se actualiza en tiempo real. El destino es una zona aproximada hasta que el cliente acepte.</p>
          {locationError && <p className="text-sm text-amber-300">{locationError}</p>}
          {location && Number.isFinite(item.latitude) && Number.isFinite(item.longitude) && mapsApiKey
            ? <iframe
              title={`Recorrido aproximado a ${item.categoryName}`}
              className="h-72 w-full rounded-xl border border-slate-700"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/directions?key=${encodeURIComponent(mapsApiKey)}&origin=${location.latitude},${location.longitude}&destination=${item.latitude},${item.longitude}&mode=driving`}
            />
            : <p className="text-sm text-slate-500">Configura la ubicación y `VITE_GOOGLE_MAPS_API_KEY` para mostrar el mapa integrado.</p>}
          {location && Number.isFinite(item.latitude) && Number.isFinite(item.longitude) && <a
            className="mt-2 inline-block text-sm font-bold text-brand-300"
            target="_blank"
            rel="noreferrer"
            href={`https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${item.latitude},${item.longitude}&travelmode=driving`}
          >Abrir ruta vial en Google Maps</a>}
        </div>}
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_2fr_auto]"><input type="number" min="1" placeholder="Tu cotización" value={quotes[item.id] ?? ''} onChange={(event) => setQuotes({ ...quotes, [item.id]: event.target.value })} /><input placeholder="Descripción de la oferta (opcional)" value={descriptions[item.id] ?? ''} onChange={(event) => setDescriptions({ ...descriptions, [item.id]: event.target.value })} /><button disabled={!quotes[item.id] || quote.isPending} onClick={() => quote.mutate(item.id)} className="rounded-lg bg-brand-500 px-3 py-2 font-bold text-slate-950 disabled:opacity-50">Cotizar</button></div>
      </article>)}</div>
    </QueryState>
  </section>
}
