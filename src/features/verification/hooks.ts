import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../lib/queryClient'
import { verificationApi } from './api'

export function usePendingVerifications() {
  return useQuery({ queryKey: queryKeys.verifications, queryFn: verificationApi.pending })
}

export function useVerifiers() {
  return useQuery({ queryKey: queryKeys.adminVerifiers, queryFn: verificationApi.verifiers })
}
