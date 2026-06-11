import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../lib/api'
import { queryKeys } from '../../lib/queryClient'
import type { UnreadCount, UserNotification } from '../../types'

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const client = useQueryClient()
  const notifications = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => api.get<UserNotification[]>('/v1/notifications').then(({ data }) => data),
    refetchInterval: 10_000,
  })
  const unread = useQuery({
    queryKey: queryKeys.unreadNotifications,
    queryFn: () => api.get<UnreadCount>('/v1/notifications/unread-count').then(({ data }) => data.count),
    refetchInterval: 10_000,
  })
  const read = useMutation({
    mutationFn: (id: string) => api.put(`/v1/notifications/${id}/read`),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notifications }),
  })

  return <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
    <div className="flex justify-between">
      <button onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 font-bold">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
        Notificaciones {(unread.data ?? 0) > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{unread.data}</span>}
      </button>
      <button onClick={() => void client.invalidateQueries({ queryKey: queryKeys.notifications })} className="text-sm text-brand-400">Actualizar</button>
    </div>
    {open && <div className="mt-3 space-y-2">
      {(notifications.data?.length ?? 0) === 0 && <p className="text-sm text-slate-500">Sin notificaciones.</p>}
      {notifications.data?.slice(0, 10).map((item) => <button
        key={item.id}
        onClick={() => !item.read && read.mutate(item.id)}
        className={`block w-full rounded-xl p-3 text-left ${item.read ? 'bg-slate-950/40 text-slate-500' : 'bg-brand-500/10 text-slate-200'}`}
      >
        <strong className="text-sm">{item.title}</strong><p className="text-xs">{item.message}</p>
        <time className="mt-1 block text-[11px] text-slate-500">{new Date(item.createdAt).toLocaleString()}</time>
      </button>)}
    </div>}
  </section>
}
