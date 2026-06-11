import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { queryKeys } from '../../../lib/queryClient'
import { apiMessage } from '../../shared/api'
import { QueryState } from '../../shared/components/QueryState'
import { clientApi } from '../api'
import { useServiceCategories } from '../hooks'
import type { ClientRequestForm } from '../types'

const emptyForm: ClientRequestForm = {
  categoryId: '', description: '', address: '', latitude: '', longitude: '', estimatedPrice: '',
}

export function CreateRequestPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState<File[]>([])
  const [notice, setNotice] = useState('')
  const [locationError, setLocationError] = useState('')
  const categories = useServiceCategories()
  const create = useMutation({
    mutationFn: async () => {
      const request = await clientApi.createRequest({
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        estimatedPrice: form.estimatedPrice ? Number(form.estimatedPrice) : null,
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

  return <section className="max-w-2xl"><h2 className="mb-4 text-2xl font-bold">Crear solicitud</h2>
    <QueryState pending={categories.isPending} error={categories.error}>
      <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} required>
          <option value="">Selecciona una categoría</option>
          {categories.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <textarea placeholder="Describe lo que necesitas" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
        <input placeholder="Dirección del servicio" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required />
        <div className="grid grid-cols-2 gap-3"><input type="number" step="any" placeholder="Latitud" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} required /><input type="number" step="any" placeholder="Longitud" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} required /></div>
        <button type="button" onClick={currentLocation} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">Usar mi ubicación</button>
        <input type="number" min="0" step="1000" placeholder="Presupuesto estimado (opcional)" value={form.estimatedPrice} onChange={(event) => setForm({ ...form, estimatedPrice: event.target.value })} />
        <label className="block text-sm text-slate-300">Imágenes del problema (opcional, máximo 5)<input type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={(event) => setImages(Array.from(event.target.files ?? []).slice(0, 5))} /></label>
        {images.length > 0 && <div className="grid grid-cols-3 gap-2">{images.map((file) => <img key={`${file.name}-${file.lastModified}`} src={URL.createObjectURL(file)} alt="" className="h-24 w-full rounded-lg object-cover" />)}</div>}
        {notice && <p className="text-sm text-emerald-400">{notice}</p>}
        {locationError && <p className="text-sm text-red-400">{locationError}</p>}
        {create.error && <p className="text-sm text-red-400">{apiMessage(create.error)}</p>}
        <button disabled={create.isPending} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">{create.isPending ? 'Creando...' : 'Crear solicitud'}</button>
      </form>
    </QueryState>
  </section>
}
