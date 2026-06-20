import { api } from '../../lib/api'
import type { ServiceCategory } from '../../types'

export interface OnboardingStatus {
  emailVerified: boolean
  phoneVerified: boolean
  onboardingCompleted: boolean
  currentStep: 'MAIN_DATA' | 'LEGAL_ACCEPTANCE' | 'PROFILE_SELFIE' | 'IDENTITY_DOCUMENT' | 'TECHNICIAN_PROFESSIONAL_PROFILE' | 'TECHNICIAN_CERTIFICATE' | 'COMPLETED'
  requiredSteps: string[]
  nextScreen?: 'HOME'
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
  profileSelfie: (payload: { profilePhotoUrl: string; faceDetectionStatus?: 'AUTO_VALIDATED' | 'MANUAL_REVIEW_REQUIRED' | 'FAILED' }) =>
    api.post<OnboardingStatus>('/v1/users/me/onboarding/profile-selfie', payload).then(({ data }) => data),
  identityDocument: (payload: {
    documentType: 'CC' | 'PASSPORT'
    documentFrontUrl?: string
    documentBackUrl?: string
    documentSingleUrl?: string
    identityDocumentCaptureStatus?: 'AUTO_CAPTURED' | 'MANUAL_CAPTURED' | 'MANUAL_REVIEW_REQUIRED'
  }) => api.post<OnboardingStatus>('/v1/users/me/onboarding/identity-document', payload).then(({ data }) => data),
  activeCategories: () => api.get<ServiceCategory[]>('/v1/service-categories').then(({ data }) => data),
  professionalProfile: (payload: { categoryIds: string[]; workExperienceDescription: string }) =>
    api.put<OnboardingStatus>('/v1/technicians/me/onboarding/professional-profile', payload).then(({ data }) => data),
  certificate: (certificateUrl?: string) =>
    api.post<OnboardingStatus>('/v1/technicians/me/onboarding/certificate', { certificateUrl }).then(({ data }) => data),
  skipCertificate: () => api.post<OnboardingStatus>('/v1/technicians/me/onboarding/skip-certificate').then(({ data }) => data),
  complete: () => api.put<OnboardingStatus>('/v1/users/me/onboarding/complete').then(({ data }) => data),
  autoComplete: () => api.post<OnboardingStatus>('/v1/users/me/onboarding/auto-complete').then(({ data }) => data),
}
