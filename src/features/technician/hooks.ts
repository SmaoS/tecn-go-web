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

export function useAssignedServiceHistory() {
  return useQuery({
    queryKey: queryKeys.technicianRequestHistory,
    queryFn: technicianApi.assignedHistory,
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

export function useTechnicianWallet() {
  const wallet = useQuery({ queryKey: queryKeys.technicianWallet, queryFn: technicianApi.wallet, refetchInterval: 10_000 })
  const transactions = useQuery({ queryKey: queryKeys.technicianWalletTransactions, queryFn: technicianApi.walletTransactions, refetchInterval: 10_000 })
  return { wallet, transactions }
}

export function useRechargeWallet() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: technicianApi.rechargeWallet,
    onSuccess: async (response) => {
      window.open(response.paymentUrl, '_blank', 'noopener,noreferrer')
      await client.invalidateQueries({ queryKey: queryKeys.technicianWallet })
      await client.invalidateQueries({ queryKey: queryKeys.technicianWalletTransactions })
    },
  })
}

export function useTechnicianReferrals() {
  const code = useQuery({ queryKey: ['referrals', 'code'], queryFn: technicianApi.referralCode })
  const referrals = useQuery({ queryKey: ['referrals', 'registrations'], queryFn: technicianApi.referrals })
  const rewards = useQuery({ queryKey: ['referrals', 'rewards'], queryFn: technicianApi.referralRewards })
  return { code, referrals, rewards }
}

export function useTechnicianRatingStatuses(requestIds: string[]) {
  return useQuery({
    queryKey: ['ratings', 'technician-statuses', ...requestIds],
    enabled: requestIds.length > 0,
    queryFn: async () => Object.fromEntries(await Promise.all(
      requestIds.map(async (id) => [id, (await technicianApi.ratingStatus(id)).rated] as const),
    )),
  })
}

export function useTechnicianAction(queryKey = queryKeys.technicianRequests) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (run: () => Promise<unknown>) => run(),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey })
      await client.invalidateQueries({ queryKey: queryKeys.technicianRequestHistory })
      await client.invalidateQueries({ queryKey: ['ratings'] })
    },
  })
}
