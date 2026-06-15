import { api } from '../../lib/api'
import type { Payment, ServiceCategory, ServiceQuote, ServiceRequest } from '../../types'

export const clientApi = {
  categories: () => api.get<ServiceCategory[]>('/v1/services').then(({ data }) => data),
  requests: () => api.get<ServiceRequest[]>('/v1/service-requests/my?activeOnly=true').then(({ data }) => data),
  requestHistory: () => api.get<ServiceRequest[]>('/v1/service-requests/my/history').then(({ data }) => data),
  payments: () => api.get<Payment[]>('/v1/payments/mine').then(({ data }) => data),
  quotes: (requestId: string) => api.get<ServiceQuote[]>(`/v1/service-requests/${requestId}/quotes`).then(({ data }) => data),
  createRequest: (payload: object) => api.post<ServiceRequest>('/v1/service-requests', payload).then(({ data }) => data),
  cancel: (id: string) => api.put(`/v1/service-requests/${id}/status`, { status: 'CANCELLED' }),
  confirmQuote: (id: string, quoteId: string) => api.put(`/v1/service-requests/${id}/confirm-quote`, { quoteId }),
  rejectQuote: (id: string, quoteId: string) => api.put(`/v1/service-requests/${id}/quotes/${quoteId}/reject`),
  payCash: (id: string) => api.post(`/v1/service-requests/${id}/payment/cash`),
  rate: (id: string, rating: { score: number; comment: string }) => api.post(`/v1/service-requests/${id}/ratings`, rating),
  ratingStatus: (id: string) => api.get<{ rated: boolean }>(`/v1/service-requests/${id}/ratings/me`).then(({ data }) => data),
  uploadImage: (id: string, file: File) => {
    const body = new FormData()
    body.append('file', file)
    return api.post(`/v1/service-requests/${id}/images`, body)
  },
}
