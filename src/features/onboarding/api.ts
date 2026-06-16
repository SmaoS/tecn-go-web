import { api } from '../../lib/api'

export interface OnboardingStatus {
  emailVerified: boolean
  onboardingCompleted: boolean
  currentStep: 'MAIN_DATA' | 'LEGAL_ACCEPTANCE' | 'PROFILE_SELFIE' | 'IDENTITY_DOCUMENT' | 'TECHNICIAN_CERTIFICATE' | 'COMPLETED'
  requiredSteps: string[]
}

export const onboardingApi = {
  status: () => api.get<OnboardingStatus>('/v1/users/me/onboarding-status').then(({ data }) => data),
  resendEmail: () => api.post('/v1/auth/send-email-verification'),
  mainData: (payload: {
    fullName: string
    phone?: string
    countryId: string
    departmentId: string
    cityId: string
    address: string
    neighborhood?: string
    documentType: 'CC' | 'PASSPORT'
    documentNumber: string
  }) => api.put<OnboardingStatus>('/v1/users/me/onboarding/main-data', payload).then(({ data }) => data),
  legalAcceptance: () => api.post<OnboardingStatus>('/v1/users/me/onboarding/legal-acceptance').then(({ data }) => data),
  profileSelfie: (profilePhotoUrl: string) =>
    api.post<OnboardingStatus>('/v1/users/me/onboarding/profile-selfie', { profilePhotoUrl }).then(({ data }) => data),
  identityDocument: (payload: {
    documentType: 'CC' | 'PASSPORT'
    documentFrontUrl?: string
    documentBackUrl?: string
    documentSingleUrl?: string
  }) => api.post<OnboardingStatus>('/v1/users/me/onboarding/identity-document', payload).then(({ data }) => data),
  certificate: (certificateUrl?: string) =>
    api.post<OnboardingStatus>('/v1/technicians/me/onboarding/certificate', { certificateUrl }).then(({ data }) => data),
  skipCertificate: () => api.post<OnboardingStatus>('/v1/technicians/me/onboarding/skip-certificate').then(({ data }) => data),
  complete: () => api.put<OnboardingStatus>('/v1/users/me/onboarding/complete').then(({ data }) => data),
}
