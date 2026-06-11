import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { serviceSupportApi } from './api'

export const useServiceEvidence = (requestId: string, enabled: boolean) => useQuery({
  queryKey: ['service-evidence', requestId],
  queryFn: () => serviceSupportApi.evidences(requestId),
  enabled,
})
export const usePaymentProofs = (requestId: string, enabled: boolean) => useQuery({
  queryKey: ['payment-proofs', requestId],
  queryFn: () => serviceSupportApi.proofs(requestId),
  enabled,
})
export function useServiceSupportAction(requestId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (action: () => Promise<unknown>) => action(),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['service-evidence', requestId] })
      void client.invalidateQueries({ queryKey: ['payment-proofs', requestId] })
    },
  })
}
export const usePendingProofs = () => useQuery({ queryKey: ['admin', 'payment-proofs'], queryFn: serviceSupportApi.pendingProofs, refetchInterval: 10_000 })
export const useReports = () => useQuery({ queryKey: ['admin', 'reports'], queryFn: serviceSupportApi.reports, refetchInterval: 10_000 })
export const useAllEvidences = () => useQuery({ queryKey: ['admin', 'evidences'], queryFn: serviceSupportApi.allEvidences, refetchInterval: 10_000 })
export function useOperationsAction() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (action: () => Promise<unknown>) => action(),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['admin'] })
    },
  })
}
