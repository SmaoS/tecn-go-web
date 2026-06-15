import { api } from '../../lib/api'
import type { ContentAsset, EvidenceType, ModeratedChatMessage, PaymentProof, ProofMethod, ServiceEvidence, UserReport } from './types'

export const serviceSupportApi = {
  evidences: (requestId: string) => api.get<ServiceEvidence[]>(`/v1/service-requests/${requestId}/evidences`).then(({ data }) => data),
  uploadEvidence: (requestId: string, file: File, evidenceType: EvidenceType, description: string) => {
    const body = new FormData()
    body.append('file', file)
    body.append('evidenceType', evidenceType)
    if (description) body.append('description', description)
    return api.post(`/v1/service-requests/${requestId}/evidences`, body)
  },
  proofs: (requestId: string) => api.get<PaymentProof[]>(`/v1/service-requests/${requestId}/payment-proofs`).then(({ data }) => data),
  uploadProof: (requestId: string, file: File, amount: number, paymentMethod: ProofMethod) => {
    const body = new FormData()
    body.append('file', file)
    body.append('amount', String(amount))
    body.append('paymentMethod', paymentMethod)
    return api.post(`/v1/service-requests/${requestId}/payment-proofs`, body)
  },
  report: (requestId: string, reason: string, description: string) =>
    api.post(`/v1/service-requests/${requestId}/reports`, { reason, description, severity: 'MEDIUM' }),
  reportContent: (contentAssetId: string, reason: string) =>
    api.post(`/v1/content/${contentAssetId}/report`, { reason }),
  pendingProofs: () => api.get<PaymentProof[]>('/v1/admin/payment-proofs/pending').then(({ data }) => data),
  reviewProof: (id: string, approved: boolean, comment = '') =>
    api.put(`/v1/admin/payment-proofs/${id}/${approved ? 'approve' : 'reject'}`, { comment }),
  reports: () => api.get<UserReport[]>('/v1/admin/reports').then(({ data }) => data),
  allEvidences: () => api.get<ServiceEvidence[]>('/v1/admin/evidences').then(({ data }) => data),
  reviewReport: (id: string, status: string, comment: string) =>
    api.put(`/v1/admin/reports/${id}/status`, { status, comment }),
  inactivateUser: (id: string, comment: string) =>
    api.put(`/v1/admin/users/${id}/inactivate`, { reason: 'REPORT', comment }),
  moderationQueue: () => api.get<ContentAsset[]>('/v1/admin/content-moderation').then(({ data }) => data),
  moderate: (id: string, approved: boolean, reason = '') =>
    api.put(`/v1/admin/content-moderation/${id}/${approved ? 'approve' : 'reject'}`, { reason }),
  chatModerationQueue: () =>
    api.get<ModeratedChatMessage[]>('/v1/admin/chat-moderation/messages').then(({ data }) => data),
  moderateChat: (id: string, action: 'approve' | 'block' | 'sanction', reason: string) =>
    api.put(`/v1/admin/chat-moderation/messages/${id}/${action}`, { reason }),
}
