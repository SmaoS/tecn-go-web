import { useQuery } from '@tanstack/react-query'
import { technicianLocationApi } from './api'

export const useTechnicianLocation = (requestId: string) => useQuery({
  queryKey: ['technician-location', requestId],
  queryFn: () => technicianLocationApi.byRequest(requestId),
  refetchInterval: 10_000,
  retry: false,
})
