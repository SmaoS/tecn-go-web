import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import { queryKeys } from '../../../lib/queryClient'
import { apiMessage } from '../../shared/api'
import { QueryState } from '../../shared/components/QueryState'
import { clientApi } from '../api'
import { useServiceCategories } from '../hooks'
import type { ClientRequestForm } from '../types'
import { useProfile } from '../../profile/hooks'
import { paymentMethodLabels, requestPaymentMethods } from '../../payments/paymentMethods'

const emptyForm: ClientRequestForm = {
  categoryId: '', description: '', address: '', latitude: '', longitude: '', estimatedPrice: '', paymentMethod: 'CASH',
}

export function CreateRequestPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState<File[]>([])
  const [notice, setNotice] = useState('')
  const [locationError, setLocationError] = useState('')
  const categories = useServiceCategories()
  const profile = useProfile()
  const create = useMutation({
    mutationFn: async () => {
      const request = await clientApi.createRequest({
        categoryId: form.categoryId,
        description: form.description,
        address: form.address,
        cityId: profile.data?.cityId,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        estimatedPrice: form.estimatedPrice ? Number(form.estimatedPrice) : null,
        paymentMethod: form.paymentMethod,
      })
      for (const image of images) await clientApi.uploadImage(request.id, image)
    },
    onSuccess: async () => {
      setForm(emptyForm)
      setImages([])
      setNotice('Solicitud creada y disponible para técnicos cercanos.')
      await queryClient.invalidateQueries({ queryKey: queryKeys.clientRequests })
    },
  })
  function submit(event: FormEvent) {
    event.preventDefault()
    setNotice('')
    create.mutate()
  }
  function currentLocation() {
    setLocationError('')
    navigator.geolocation.getCurrentPosition(({ coords }) => setForm((value) => ({
      ...value, latitude: String(coords.latitude), longitude: String(coords.longitude),
    })), () => setLocationError('No fue posible obtener la ubicación del navegador.'))
  }
  useEffect(() => currentLocation(), [])

  return <section className="max-w-2xl"><h2 className="mb-4 text-2xl font-bold">Crear solicitud</h2>
    <QueryState pending={categories.isPending} error={categories.error}>
      <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} required>
          <option value="">Selecciona una categoría</option>
          {categories.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300">
          <p className="font-semibold text-slate-100">Ciudad del servicio</p>
          <p>{profile.data?.cityName ?? profile.data?.homeCity ?? 'No configurada en tu perfil'}</p>
          <p className="mt-1 text-xs text-slate-500">Se toma automáticamente de tu perfil. Puedes cambiar dirección y ubicación exacta para este servicio.</p>
        </div>
        <textarea placeholder="Describe lo que necesitas" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
        <input placeholder="Dirección del servicio" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required />
        <button type="button" onClick={currentLocation} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">{form.latitude && form.longitude ? 'Ubicación GPS lista' : 'Obtener ubicación GPS'}</button>
        <input type="number" min="0" step="1000" placeholder="Presupuesto estimado (opcional)" value={form.estimatedPrice} onChange={(event) => setForm({ ...form, estimatedPrice: event.target.value })} />
        <label className="block text-sm text-slate-300">¿Por dónde vas a pagar?
          <select value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value as ClientRequestForm['paymentMethod'] })} required>
            {requestPaymentMethods.map((method) => <option key={method} value={method}>{paymentMethodLabels[method]}</option>)}
          </select>
        </label>
        <label className="block text-sm text-slate-300">Imágenes del problema (opcional, máximo 5)<input type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={(event) => setImages(Array.from(event.target.files ?? []).slice(0, 5))} /></label>
        {images.length > 0 && <div className="grid grid-cols-3 gap-2">{images.map((file) => <img key={`${file.name}-${file.lastModified}`} src={URL.createObjectURL(file)} alt="" className="h-24 w-full rounded-lg object-cover" />)}</div>}
        {notice && <p className="text-sm text-emerald-400">{notice}</p>}
        {locationError && <p className="text-sm text-red-400">{locationError}</p>}
        {create.error && <p className="text-sm text-red-400">{apiMessage(create.error)}</p>}
        {!profile.data?.cityId && <p className="text-sm text-amber-300">Completa la ciudad en Mi perfil antes de crear una solicitud.</p>}
        {(!form.latitude || !form.longitude) && <p className="text-sm text-amber-300">Se requiere ubicación GPS para publicar.</p>}
        <button disabled={create.isPending || !profile.data?.cityId || !form.latitude || !form.longitude} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">{create.isPending ? 'Creando...' : 'Crear solicitud'}</button>
      </form>
    </QueryState>
  </section>
}
