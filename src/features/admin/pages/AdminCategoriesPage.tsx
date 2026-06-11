import { useState, type FormEvent } from 'react'
import { queryKeys } from '../../../lib/queryClient'
import type { ServiceCategory } from '../../../types'
import { QueryState } from '../../shared/components/QueryState'
import { adminApi } from '../api'
import { useAdminAction, useAdminCategories } from '../hooks'
import type { CategoryForm } from '../types'

export function AdminCategoriesPage() {
  const [form, setForm] = useState<CategoryForm>({ name: '', description: '', active: true })
  const categories = useAdminCategories()
  const action = useAdminAction(queryKeys.adminCategories)
  function submit(event: FormEvent) {
    event.preventDefault()
    action.mutate(() => adminApi.createCategory(form), {
      onSuccess: () => setForm({ name: '', description: '', active: true }),
    })
  }
  function edit(category: ServiceCategory) {
    const name = window.prompt('Nombre de la categoría', category.name)
    if (!name) return
    const description = window.prompt('Descripción', category.description) ?? category.description
    action.mutate(() => adminApi.updateCategory({ ...category, name, description }))
  }

  return <section><h2 className="mb-4 text-2xl font-bold">Categorías</h2>
    <form onSubmit={submit} className="mb-4 space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-5"><input placeholder="Nombre" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /><input placeholder="Descripción" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><button disabled={action.isPending} className="rounded-lg bg-brand-500 px-4 py-2 font-bold text-slate-950">Crear</button></form>
    {action.error && <p className="mb-4 text-red-300">No fue posible actualizar la categoría.</p>}
    <QueryState pending={categories.isPending} error={categories.error} empty={categories.data?.length === 0}>
      <div className="space-y-2">{categories.data?.map((category) => <div key={category.id} className="rounded-xl border border-slate-800 p-4"><div className="flex items-center justify-between"><div><strong>{category.name}</strong><p className="text-xs text-slate-500">{category.active ? 'Activa' : 'Inactiva'}</p></div><div className="flex gap-2"><button onClick={() => edit(category)} className="rounded-lg border border-slate-700 px-3 py-2">Editar</button><button onClick={() => action.mutate(() => adminApi.updateCategory({ ...category, active: !category.active }))} className="rounded-lg border border-slate-700 px-3 py-2">{category.active ? 'Desactivar' : 'Activar'}</button><button onClick={() => window.confirm(`¿Desactivar ${category.name}?`) && action.mutate(() => adminApi.deleteCategory(category.id))} className="rounded-lg border border-red-500/50 px-3 py-2 text-red-300">Eliminar</button></div></div></div>)}</div>
    </QueryState>
  </section>
}
