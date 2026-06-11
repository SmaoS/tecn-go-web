import { api } from '../../lib/api'
import type { LegalDocument } from './types'

export const legalApi = {
  active: () => api.get<LegalDocument[]>('/v1/legal/documents/active').then(({ data }) => data),
  accept: (id: string) => api.post(`/v1/legal/documents/${id}/accept`),
  all: () => api.get<LegalDocument[]>('/v1/admin/legal-documents').then(({ data }) => data),
  activate: (id: string) => api.put(`/v1/admin/legal-documents/${id}/activate`),
  create: (value: Omit<LegalDocument, 'id' | 'accepted'>) => api.post('/v1/admin/legal-documents', value),
}
