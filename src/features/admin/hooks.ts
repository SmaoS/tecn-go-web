import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/queryClient'
import { adminApi } from './api'

export const useAdminSummary = () => useQuery({
  queryKey: queryKeys.adminSummary, queryFn: adminApi.summary, refetchInterval: 10_000,
})
export const useAdminCategories = () => useQuery({
  queryKey: queryKeys.adminCategories, queryFn: adminApi.categories,
})
export const useAdminFinances = () => useQuery({
  queryKey: queryKeys.adminFinances, queryFn: adminApi.finances, refetchInterval: 10_000,
})
export const useAdminParameters = () => useQuery({
  queryKey: queryKeys.adminParameters, queryFn: adminApi.parameters,
})
export const useAdminLocations = () => useQuery({
  queryKey: queryKeys.adminLocations, queryFn: adminApi.locations, refetchInterval: 10_000,
})
export const usePendingTechnicians = () => useQuery({
  queryKey: queryKeys.adminPendingTechnicians, queryFn: adminApi.pendingTechnicians, refetchInterval: 10_000,
})

export function useAdminAction(queryKey: readonly unknown[]) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (run: () => Promise<unknown>) => run(),
    onSuccess: () => client.invalidateQueries({ queryKey }),
  })
}
