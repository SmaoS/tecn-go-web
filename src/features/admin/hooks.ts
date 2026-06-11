import { useQuery } from '@tanstack/react-query'
import { adminApi } from './api'

export function useAdminDashboardData() {
  const pending = useQuery({ queryKey: ['admin', 'technicians', 'pending'], queryFn: adminApi.pendingTechnicians, refetchInterval: 10_000 })
  const categories = useQuery({ queryKey: ['admin', 'categories'], queryFn: adminApi.categories })
  const finances = useQuery({ queryKey: ['admin', 'finances'], queryFn: adminApi.finances, refetchInterval: 10_000 })
  const summary = useQuery({ queryKey: ['admin', 'summary'], queryFn: adminApi.summary, refetchInterval: 10_000 })
  const parameters = useQuery({ queryKey: ['admin', 'parameters'], queryFn: adminApi.parameters })
  const locations = useQuery({ queryKey: ['admin', 'technician-locations'], queryFn: adminApi.locations, refetchInterval: 10_000 })
  return { pending, categories, finances, summary, parameters, locations }
}
