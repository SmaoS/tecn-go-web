import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/queryClient'
import type { UserNotification } from '../../types'
import { notificationsApi } from './api'

const mergeNotifications = (current: UserNotification[], incoming: UserNotification[]) => {
  const byId = new Map(current.map((item) => [item.id, item]))
  incoming.forEach((item) => byId.set(item.id, item))
  return [...byId.values()].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
}

export const useNotifications = () => {
  const client = useQueryClient()
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: async () => {
      const current = client.getQueryData<UserNotification[]>(queryKeys.notifications) ?? []
      const after = current[0]?.createdAt
      const incoming = await notificationsApi.all(after)
      return mergeNotifications(current, incoming)
    },
    refetchInterval: 10_000,
  })
}
export const useUnreadNotifications = () => useQuery({
  queryKey: queryKeys.unreadNotifications, queryFn: notificationsApi.unread, refetchInterval: 10_000,
})
export function useReadNotification() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.read,
    onSuccess: async (_, id) => {
      client.setQueryData<UserNotification[]>(queryKeys.notifications,
        (items = []) => items.map((item) => item.id === id ? { ...item, read: true } : item))
      await client.invalidateQueries({ queryKey: queryKeys.unreadNotifications })
    },
  })
}

export function useDeleteNotification() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess: async (_, id) => {
      client.setQueryData<UserNotification[]>(queryKeys.notifications,
        (items = []) => items.filter((item) => item.id !== id))
      await client.invalidateQueries({ queryKey: queryKeys.unreadNotifications })
    },
  })
}
