import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../lib/queryClient'
import { technicianApi } from './api'

export function useTechnicianDashboardData(radiusKm: string) {
  const categories = useQuery({ queryKey: queryKeys.categories, queryFn: technicianApi.categories })
  const profile = useQuery({
    queryKey: queryKeys.technicianProfile,
    queryFn: technicianApi.profile,
    retry: false,
  })
  const assigned = useQuery({
    queryKey: queryKeys.technicianRequests,
    queryFn: technicianApi.assigned,
    refetchInterval: 10_000,
  })
  const earnings = useQuery({ queryKey: queryKeys.earnings, queryFn: technicianApi.earnings })
  const available = useQuery({
    queryKey: queryKeys.availableRequests(radiusKm),
    queryFn: () => technicianApi.available(radiusKm),
    enabled: profile.data?.status === 'APPROVED',
    refetchInterval: 10_000,
  })
  return { categories, profile, assigned, earnings, available }
}
