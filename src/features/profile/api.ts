import { api } from '../../lib/api'
import type { UserProfile } from '../../types'

function verifyPhoneOtpBody(phone: string, code: string, countryId?: string) {
  return countryId ? { phone, code, countryId } : { phone, code }
}

export const profileApi = {
  me: () => api.get<UserProfile>('/v1/users/me/profile').then(({ data }) => data),
  save: (profile: UserProfile) => api.put<UserProfile>('/v1/users/me/profile', profile).then(({ data }) => data),
  verifyEmail: () => api.post('/v1/auth/send-email-verification'),
  sendPhoneOtp: ({ phone, countryId }: { phone: string; countryId?: string }) =>
    api.post<{ debugCode?: string }>('/v1/auth/phone/send-otp', { phone, countryId }).then(({ data }) => data),
  verifyPhoneOtp: (phone: string, code: string, countryId?: string) => api.post('/v1/auth/phone/verify-otp', verifyPhoneOtpBody(phone, code, countryId)),
  changePassword: (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    api.post<{ message: string }>('/v1/users/me/change-password', payload).then(({ data }) => data),
}
