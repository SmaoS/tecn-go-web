import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { PrivateImage } from '../../../components/PrivateImage'
import { api } from '../../../lib/api'

type Role = 'CLIENT' | 'TECHNICIAN' | 'ADMIN' | 'VERIFIER'
type AccountStatus = 'ACTIVE' | 'INACTIVE_PAYMENT' | 'INACTIVE_REPORT' | 'INACTIVE_ADMIN' | 'BLOCKED' | 'DELETED_LOGICAL'

interface AdminUser {
  id: string
  fullName: string
  email?: string
  phone?: string
  profilePhotoUrl?: string
  primaryRole: Role
  roles: Role[]
  accountStatus: AccountStatus
  verificationStatus: 'CREATED' | 'PENDING_VERIFICATION' | 'VERIFIED'
  onboardingCompleted: boolean
  onboardingStep: string
  onboardingStatus: 'COMPLETED' | 'PENDING'
  onboardingComments: string[]
  createdAt: string
}

interface PageResponse<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}

interface InactiveUser {
  id: string
}

const roles: Array<{ value: Role; label: string }> = [
  { value: 'CLIENT', label: 'Cliente' },
  { value: 'TECHNICIAN', label: 'Técnico' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'VERIFIER', label: 'Verificador' },
]

const statuses: Array<{ value: AccountStatus; label: string }> = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'INACTIVE_PAYMENT', label: 'Inactivo por pago' },
  { value: 'INACTIVE_REPORT', label: 'Inactivo por reporte' },
  { value: 'INACTIVE_ADMIN', label: 'Inactivo por admin' },
  { value: 'BLOCKED', label: 'Bloqueado' },
  { value: 'DELETED_LOGICAL', label: 'Eliminado lógico' },
]

const statusLabel: Record<AccountStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE_PAYMENT: 'Inactivo por pago',
  INACTIVE_REPORT: 'Inactivo por reporte',
  INACTIVE_ADMIN: 'Inactivo por admin',
  BLOCKED: 'Bloqueado',
  DELETED_LOGICAL: 'Eliminado lógico',
}

export function AdminUsersPage() {
  const client = useQueryClient()
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    name: '',
    createdFrom: '',
    createdTo: '',
    page: 0,
  })
  const params = useMemo(() => ({
    role: filters.role || undefined,
    status: filters.status || undefined,
    name: filters.name.trim() || undefined,
    createdFrom: toStartInstant(filters.createdFrom),
    createdTo: toEndInstant(filters.createdTo),
    page: filters.page,
    size: 25,
  }), [filters])
  const users = useQuery({
    queryKey: ['admin', 'users-search', params],
    queryFn: () => api.get<PageResponse<AdminUser>>('/v1/admin/users/search', { params }).then(({ data }) => data),
  })
  const activate = useMutation({
    mutationFn: (id: string) => api.put<InactiveUser>(`/v1/admin/users/${id}/activate`),
    onSuccess: () => void client.invalidateQueries({ queryKey: ['admin', 'users-search'] }),
  })

  return <section className="space-y-5">
    <div>
      <h2 className="text-2xl font-bold">Usuarios</h2>
      <p className="text-sm text-slate-400">
        Consulta usuarios y revisa qué les falta para terminar el registro.
      </p>
    </div>

    <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-5">
      <label className="text-sm">Rol
        <select value={filters.role} onChange={(event) => setFilters({ ...filters, role: event.target.value, page: 0 })}>
          <option value="">Todos</option>
          {roles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </label>
      <label className="text-sm">Estado
        <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value, page: 0 })}>
          <option value="">Todos</option>
          {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </label>
      <label className="text-sm">Desde
        <input type="date" value={filters.createdFrom}
          onChange={(event) => setFilters({ ...filters, createdFrom: event.target.value, page: 0 })} />
      </label>
      <label className="text-sm">Hasta
        <input type="date" value={filters.createdTo}
          onChange={(event) => setFilters({ ...filters, createdTo: event.target.value, page: 0 })} />
      </label>
      <label className="text-sm">Nombre, correo o celular
        <input value={filters.name} placeholder="Buscar usuario"
          onChange={(event) => setFilters({ ...filters, name: event.target.value, page: 0 })} />
      </label>
    </div>

    {users.isPending && <p className="text-sm text-slate-400">Cargando usuarios...</p>}
    {users.error && <p className="text-sm text-red-300">No fue posible consultar usuarios.</p>}

    <div className="overflow-x-auto rounded-2xl border border-slate-800">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="bg-slate-900 text-slate-300">
          <tr>
            <th className="px-4 py-3">Usuario</th>
            <th className="px-4 py-3">Correo</th>
            <th className="px-4 py-3">Celular</th>
            <th className="px-4 py-3">Rol</th>
            <th className="px-4 py-3">Onboarding</th>
            <th className="px-4 py-3">Comentarios</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Creado</th>
          </tr>
        </thead>
        <tbody>
          {users.data?.content.map((user) => <tr key={user.id} className="border-t border-slate-800 align-top">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                {user.profilePhotoUrl
                  ? <PrivateImage src={user.profilePhotoUrl} alt={user.fullName} className="h-12 w-12 rounded-full object-cover" />
                  : <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-800 font-bold text-brand-300">
                    {initials(user.fullName)}
                  </span>}
                <div>
                  <strong>{user.fullName}</strong>
                  <p className="text-xs text-slate-500">{user.id}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3">{user.email ?? '-'}</td>
            <td className="px-4 py-3">{user.phone ?? '-'}</td>
            <td className="px-4 py-3">{user.roles.join(', ') || user.primaryRole}</td>
            <td className="px-4 py-3">
              <span className={user.onboardingCompleted ? 'text-emerald-300' : 'text-amber-300'}>
                {user.onboardingCompleted ? 'Completo' : 'Pendiente'}
              </span>
              <p className="text-xs text-slate-400">{user.onboardingStep}</p>
              <p className="text-xs text-slate-500">{user.verificationStatus}</p>
            </td>
            <td className="px-4 py-3">
              <ul className="space-y-1">
                {user.onboardingComments.map((comment) => <li key={comment} className="text-xs text-slate-300">• {comment}</li>)}
              </ul>
            </td>
            <td className="px-4 py-3">
              <span className={user.accountStatus === 'ACTIVE' ? 'text-emerald-300' : 'text-red-300'}>
                {statusLabel[user.accountStatus]}
              </span>
              {user.accountStatus !== 'ACTIVE' && <button disabled={activate.isPending}
                onClick={() => activate.mutate(user.id)}
                className="mt-2 block rounded bg-emerald-500 px-3 py-1 text-xs font-bold text-slate-950 disabled:opacity-50">
                Activar
              </button>}
            </td>
            <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
          </tr>)}
          {users.data?.content.length === 0 && <tr><td className="px-4 py-6 text-center text-slate-400" colSpan={8}>
            No hay usuarios con estos filtros.
          </td></tr>}
        </tbody>
      </table>
    </div>

    <div className="flex items-center justify-between text-sm text-slate-400">
      <span>{users.data?.totalElements ?? 0} usuarios encontrados</span>
      <div className="flex gap-2">
        <button disabled={!users.data || filters.page <= 0}
          onClick={() => setFilters({ ...filters, page: Math.max(0, filters.page - 1) })}
          className="rounded border border-slate-700 px-3 py-2 disabled:opacity-40">Anterior</button>
        <span className="px-3 py-2">Página {(users.data?.number ?? 0) + 1} de {users.data?.totalPages || 1}</span>
        <button disabled={!users.data || filters.page + 1 >= users.data.totalPages}
          onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          className="rounded border border-slate-700 px-3 py-2 disabled:opacity-40">Siguiente</button>
      </div>
    </div>
  </section>
}

function toStartInstant(value: string) {
  return value ? `${value}T00:00:00Z` : undefined
}

function toEndInstant(value: string) {
  return value ? `${value}T23:59:59Z` : undefined
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'TG'
}
