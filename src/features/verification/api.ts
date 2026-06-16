import { api } from '../../lib/api'
import type { UserVerification, Verifier } from '../../types'

export const verificationApi = {
  pending: () => api.get<UserVerification[]>('/v1/verifications/pending').then(({ data }) => data),
  verify: (id: string) => api.put(`/v1/verifications/${id}/verify`),
  verifyProfilePhoto: (id: string) => api.put(`/v1/verifications/${id}/profile-photo/verify`),
  reject: (id: string) => api.put(`/v1/admin/users/${id}/reject-documents`),
  verifiers: () => api.get<Verifier[]>('/v1/admin/verifiers').then(({ data }) => data),
  createVerifier: (value: {
    fullName: string
    email: string
    password: string
    homeAddress: string
    homeCity: string
    homeNeighborhood: string
    homeLatitude: number | null
    homeLongitude: number | null
    countryId?: string
    departmentId?: string
    cityId?: string
  }) => api.post('/v1/admin/verifiers', value),
  evidence: (url: string) => api.get(url, { responseType: 'blob' }).then(({ data }) => data),
}
