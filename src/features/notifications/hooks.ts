import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/queryClient'
import { notificationsApi } from './api'

export const useNotifications = () => useQuery({
  queryKey: queryKeys.notifications, queryFn: notificationsApi.all, refetchInterval: 10_000,
})
export const useUnreadNotifications = () => useQuery({
  queryKey: queryKeys.unreadNotifications, queryFn: notificationsApi.unread, refetchInterval: 10_000,
})
export function useReadNotification() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.read,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.notifications }),
        client.invalidateQueries({ queryKey: queryKeys.unreadNotifications }),
      ])
    },
  })
}
