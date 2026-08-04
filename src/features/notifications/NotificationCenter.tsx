import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { queryKeys } from '../../lib/queryClient'
import { QueryState } from '../shared/components/QueryState'
import { useDeleteNotification, useNotifications, useReadNotification, useUnreadNotifications } from './hooks'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { workflowPaths } from '../../routes/paths'
import type { UserNotification } from '../../types'
import { notificationTitle } from './labels'

export function NotificationCenter({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const client = useQueryClient()
  const notifications = useNotifications()
  const unread = useUnreadNotifications()
  const read = useReadNotification()
  const deleteNotification = useDeleteNotification()
  const navigate = useNavigate()
  const { session } = useAuth()
  function select(item: UserNotification) {
    if (!item.read) read.mutate(item.id)
    if (item.route === 'Legal' || item.type === 'LEGAL_ACCEPTANCE_REQUIRED') {
      navigate(session?.role === 'TECHNICIAN' ? workflowPaths.technician.legal : workflowPaths.client.legal)
    } else if ((item.route === 'AvailableRequests' || item.type === 'NEW_REQUEST') && session?.role === 'TECHNICIAN') {
      navigate(workflowPaths.technician.available)
    } else if (session?.role === 'TECHNICIAN') {
      navigate(workflowPaths.technician.assigned)
    } else if (session?.role === 'CLIENT') {
      navigate(workflowPaths.client.requests)
    }
  }

  if (compact) {
    return <div className="relative">
      <button
        type="button"
        aria-label="Notificaciones"
        onClick={() => setOpen((value) => !value)}
        className="tecngo-touch-target relative grid rounded-2xl border border-slate-700 bg-surface place-items-center"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
        {(unread.data ?? 0) > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1 text-[10px] font-black text-white">{unread.data}</span>}
      </button>
      {open && <div className="fixed inset-x-3 top-[calc(4.5rem+var(--tecngo-safe-top))] z-50 max-h-[70svh] overflow-y-auto rounded-3xl border border-slate-700 bg-surface p-3 shadow-2xl shadow-black/50">
        <div className="mb-2 flex items-center justify-between">
          <strong>Notificaciones</strong>
          <button type="button" onClick={() => void client.invalidateQueries({ queryKey: queryKeys.notifications })} className="text-xs font-bold text-brand-400">Actualizar</button>
        </div>
        <NotificationList
          pending={notifications.isPending}
          error={notifications.error ?? unread.error}
          notifications={notifications.data}
          select={select}
          deleteNotification={(id) => deleteNotification.mutate(id)}
        />
      </div>}
    </div>
  }

  return <section className="tecngo-panel mb-8 p-5">
    <div className="flex justify-between">
      <button onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 font-bold">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
        Notificaciones {(unread.data ?? 0) > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{unread.data}</span>}
      </button>
      <button onClick={() => void client.invalidateQueries({ queryKey: queryKeys.notifications })} className="text-sm text-brand-400">Actualizar</button>
    </div>
    {open && <NotificationList
      pending={notifications.isPending}
      error={notifications.error ?? unread.error}
      notifications={notifications.data}
      select={select}
      deleteNotification={(id) => deleteNotification.mutate(id)}
    />}
  </section>
}

function NotificationList({ pending, error, notifications, select, deleteNotification }: {
  pending: boolean
  error: unknown
  notifications?: UserNotification[]
  select: (item: UserNotification) => void
  deleteNotification: (id: string) => void
}) {
  return <QueryState pending={pending} error={error}><div className="mt-3 space-y-2">
    {(notifications?.length ?? 0) === 0 && <p className="text-sm text-slate-500">Sin notificaciones.</p>}
    {notifications?.slice(0, 10).map((item) => <div
      key={item.id}
      className={`flex items-start gap-3 rounded-xl p-3 ${item.read ? 'bg-slate-950/40 text-slate-500' : 'bg-brand-500/10 text-slate-200'}`}
    >
      <button onClick={() => select(item)} className="min-w-0 flex-1 text-left">
        <strong className="text-sm">{notificationTitle(item)}</strong><p className="text-xs">{item.message}</p>
        <time className="mt-1 block text-[11px] text-slate-500">{new Date(item.createdAt).toLocaleString()}</time>
      </button>
      <button
        type="button"
        aria-label="Eliminar notificación"
        title="Eliminar"
        onClick={() => deleteNotification(item.id)}
        className="rounded-full border border-slate-700 px-2 py-0.5 text-xs text-slate-400 hover:border-red-400 hover:text-red-300"
      >
        ×
      </button>
    </div>)}
  </div></QueryState>
}
