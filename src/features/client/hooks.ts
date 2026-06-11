import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../lib/queryClient'
import type { ServiceQuote } from '../../types'
import { clientApi } from './api'

export function useClientDashboardData() {
  const categories = useQuery({ queryKey: queryKeys.categories, queryFn: clientApi.categories })
  const requests = useQuery({
    queryKey: queryKeys.clientRequests,
    queryFn: clientApi.requests,
    refetchInterval: 10_000,
  })
  const payments = useQuery({ queryKey: queryKeys.payments, queryFn: clientApi.payments })
  const quotes = useQuery({
    queryKey: ['service-quotes', requests.data?.map((item) => item.id)],
    enabled: Boolean(requests.data),
    refetchInterval: 10_000,
    queryFn: async () => Object.fromEntries(await Promise.all(
      (requests.data ?? []).map(async (request) => [request.id, await clientApi.quotes(request.id)] as const),
    )) as Record<string, ServiceQuote[]>,
  })
  return { categories, requests, payments, quotes }
}
