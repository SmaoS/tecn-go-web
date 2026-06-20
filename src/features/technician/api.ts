import { api } from '../../lib/api'
import type { FinancialSummary, RechargeResponse, ReferralCode, ReferralRegistration, ReferralReward, ServiceCategory, ServiceRequest, TechnicianProfile, TechnicianWallet, TechnicianWalletTransaction } from '../../types'

export interface AvailableRequestSearch {
  cityId?: string
  categoryId?: string
  useRadius?: boolean
  radiusKm?: number
}

export const technicianApi = {
  sendEmailVerification: () => api.post('/v1/auth/send-email-verification'),
  categories: () => api.get<ServiceCategory[]>('/v1/service-categories').then(({ data }) => data),
  profile: () => api.get<TechnicianProfile>('/v1/technicians/me').then(({ data }) => data),
  assigned: () => api.get<ServiceRequest[]>('/v1/service-requests/my-assigned?activeOnly=true').then(({ data }) => data),
  assignedHistory: () => api.get<ServiceRequest[]>('/v1/service-requests/my-assigned/history').then(({ data }) => data),
  available: (search: AvailableRequestSearch = {}) =>
    api.get<ServiceRequest[]>('/v1/service-requests/available', { params: search }).then(({ data }) => data),
  earnings: () => api.get<FinancialSummary>('/v1/technicians/me/earnings').then(({ data }) => data),
  wallet: () => api.get<TechnicianWallet>('/v1/technicians/me/wallet').then(({ data }) => data),
  walletTransactions: () => api.get<TechnicianWalletTransaction[]>('/v1/technicians/me/wallet/transactions').then(({ data }) => data),
  rechargeWallet: (amount: number) => api.post<RechargeResponse>('/v1/technicians/me/wallet/recharge', { amount }).then(({ data }) => data),
  saveProfile: (profile: TechnicianProfile | null, payload: object) => profile
    ? api.put('/v1/technicians/me', payload)
    : api.post('/v1/technicians/profile', payload),
  quote: (id: string, technicianPrice: number, description?: string) => api.put(`/v1/service-requests/${id}/quote`, { technicianPrice, description }),
  advance: (id: string, status: string) => api.put(`/v1/service-requests/${id}/status`, { status }),
  rate: (id: string, score: number, comment: string) => api.post(`/v1/service-requests/${id}/ratings`, { score, comment }),
  ratingStatus: (id: string) => api.get<{ rated: boolean }>(`/v1/service-requests/${id}/ratings/me`).then(({ data }) => data),
  location: (payload: object) => api.put('/v1/technicians/me/location', payload),
  referralCode: () => api.get<ReferralCode>('/v1/technicians/me/referral-code').then(({ data }) => data),
  referrals: () => api.get<ReferralRegistration[]>('/v1/technicians/me/referrals').then(({ data }) => data),
  referralRewards: () => api.get<ReferralReward[]>('/v1/technicians/me/referral-rewards').then(({ data }) => data),
}
