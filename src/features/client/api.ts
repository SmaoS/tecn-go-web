import { api } from '../../lib/api'
import type { PageResponse, Payment, ServiceCategory, ServiceQuote, ServiceRequest } from '../../types'

export const clientApi = {
  categories: () => api.get<ServiceCategory[]>('/v1/services').then(({ data }) => data),
  requests: () => api.get<PageResponse<ServiceRequest>>('/v1/service-requests/my/page?activeOnly=true&page=0&size=20').then(({ data }) => data.content),
  requestHistory: () => api.get<PageResponse<ServiceRequest>>('/v1/service-requests/my/history/page?page=0&size=20').then(({ data }) => data.content),
  payments: () => api.get<Payment[]>('/v1/payments/mine').then(({ data }) => data),
  quotes: (requestId: string) => api.get<ServiceQuote[]>(`/v1/service-requests/${requestId}/quotes`).then(({ data }) => data),
  createRequest: (payload: object) => api.post<ServiceRequest>('/v1/service-requests', payload).then(({ data }) => data),
  cancel: (id: string) => api.put(`/v1/service-requests/${id}/status`, { status: 'CANCELLED' }),
  confirmQuote: (id: string, quoteId: string) => api.put(`/v1/service-requests/${id}/confirm-quote`, { quoteId }),
  rejectQuote: (id: string, quoteId: string) => api.put(`/v1/service-requests/${id}/quotes/${quoteId}/reject`),
  rate: (id: string, rating: { score: number; comment: string }) => api.post(`/v1/service-requests/${id}/ratings`, rating),
  ratingStatus: (id: string) => api.get<{ rated: boolean }>(`/v1/service-requests/${id}/ratings/me`).then(({ data }) => data),
  uploadImage: (id: string, file: File) => {
    const body = new FormData()
    body.append('file', file)
    return api.post(`/v1/service-requests/${id}/images`, body)
  },
}
