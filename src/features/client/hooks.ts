import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/queryClient'
import type { ServiceQuote } from '../../types'
import { clientApi } from './api'

export function useClientRequests() {
  return useQuery({
    queryKey: queryKeys.clientRequests,
    queryFn: clientApi.requests,
    refetchInterval: 10_000,
  })
}

export function useClientQuotes(requestIds: string[]) {
  return useQuery({
    queryKey: queryKeys.requestQuotes(requestIds),
    enabled: requestIds.length > 0,
    refetchInterval: 10_000,
    queryFn: async () => Object.fromEntries(await Promise.all(
      requestIds.map(async (id) => [id, await clientApi.quotes(id)] as const),
    )) as Record<string, ServiceQuote[]>,
  })
}

export function useClientPayments() {
  return useQuery({ queryKey: queryKeys.payments, queryFn: clientApi.payments })
}

export function useServiceCategories() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: clientApi.categories })
}

export function useClientRequestAction() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (run: () => Promise<unknown>) => run(),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.clientRequests }),
        client.invalidateQueries({ queryKey: queryKeys.payments }),
        client.invalidateQueries({ queryKey: ['service-quotes'] }),
      ])
    },
  })
}
