import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'

interface InactiveUser {
  id: string
  fullName: string
  email: string
  role: string
  accountStatus: string
  reason: string
  comment: string
}

export function AdminUsersPage() {
  const client = useQueryClient()
  const users = useQuery({ queryKey: ['admin', 'inactive-users'], queryFn: () => api.get<InactiveUser[]>('/v1/admin/users/inactive').then(({ data }) => data) })
  const activate = useMutation({
    mutationFn: (id: string) => api.put(`/v1/admin/users/${id}/activate`),
    onSuccess: () => void client.invalidateQueries({ queryKey: ['admin', 'inactive-users'] }),
  })
  return <section><h2 className="mb-4 text-2xl font-bold">Usuarios inactivos</h2>
    <div className="space-y-3">{users.data?.map((user) => <article key={user.id} className="rounded-xl border border-slate-800 p-4">
      <strong>{user.fullName} · {user.role}</strong><p className="text-sm text-slate-400">{user.email}</p><p className="mt-2 text-sm text-red-300">{user.accountStatus} · {user.reason}</p><p className="text-sm">{user.comment}</p>
      <button disabled={activate.isPending} onClick={() => activate.mutate(user.id)} className="mt-3 rounded bg-emerald-500 px-3 py-2 font-bold text-slate-950">Activar usuario</button>
    </article>)}</div>
  </section>
}
