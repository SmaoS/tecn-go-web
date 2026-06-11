import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/queryClient'
import { technicianApi } from './api'

export function useTechnicianProfile() {
  return useQuery({ queryKey: queryKeys.technicianProfile, queryFn: technicianApi.profile, retry: false })
}

export function useTechnicianCategories() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: technicianApi.categories })
}

export function useAssignedServices() {
  return useQuery({
    queryKey: queryKeys.technicianRequests,
    queryFn: technicianApi.assigned,
    refetchInterval: 10_000,
  })
}

export function useAvailableServices(radiusKm: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.availableRequests(radiusKm),
    queryFn: () => technicianApi.available(radiusKm),
    enabled,
    refetchInterval: 10_000,
  })
}

export function useTechnicianEarnings() {
  return useQuery({ queryKey: queryKeys.earnings, queryFn: technicianApi.earnings })
}

export function useTechnicianAction(queryKey = queryKeys.technicianRequests) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (run: () => Promise<unknown>) => run(),
    onSuccess: () => client.invalidateQueries({ queryKey }),
  })
}
