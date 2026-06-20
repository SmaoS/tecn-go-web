export type Role = 'CLIENT' | 'TECHNICIAN' | 'VERIFIER' | 'ADMIN'
export type VerificationStatus = 'CREATED' | 'PENDING_VERIFICATION' | 'VERIFIED'

export interface Session {
  token: string
  userId: string
  fullName: string
  email?: string
  roles?: Role[]
  activeMode?: 'CLIENT' | 'TECHNICIAN'
  role: Role
  verificationStatus: VerificationStatus
  emailVerified: boolean
  phoneVerified: boolean
  documentsVerified: boolean
  onboardingCompleted: boolean
}

export interface ServiceCategory {
  id: string
  name: string
  slug: string
  description: string
  active: boolean
}

export interface CatalogItem {
  id: string
  name: string
}

export interface ServiceRequest {
  id: string
  clientId: string
  clientName: string
  technicianId?: string
  technicianName?: string
  clientProfilePhotoUrl?: string
  clientAverageRating: number
  clientPaidServicesCount: number
  technicianProfilePhotoUrl?: string
  technicianAverageRating?: number
  technicianCompletedServicesCount: number
  technicianExperienceDescription?: string
  technicianCategories: string[]
  certifiedTechnician?: boolean
  categoryId: string
  categoryName: string
  description: string
  address: string
  latitude: number
  longitude: number
  distanceKm?: number
  estimatedPrice?: number
  technicianPrice?: number
  finalPrice?: number
  requestedPaymentMethod: 'CASH' | 'BREB' | 'NEQUI' | 'DAVIPLATA' | 'BANCOLOMBIA' | 'DAVIVIENDA' | 'WOMPI' | 'MERCADO_PAGO' | 'PAYU'
  status: RequestStatus
  createdAt: string
  serviceImagesCount: number
  firstServiceImageUrl?: string
  images: ServiceRequestImage[]
  cityId?: string
  cityName?: string
}

export interface ServiceRequestImage {
  id: string
  serviceRequestId: string
  imageUrl: string
  publicId: string
  createdAt: string
}

export interface ServiceQuote {
  id: string
  serviceRequestId: string
  technicianId: string
  technicianName: string
  technicianProfilePhotoUrl?: string
  technicianAverageRating: number
  technicianCompletedServicesCount: number
  technicianExperienceDescription?: string
  technicianCategories: string[]
  certifiedTechnician?: boolean
  price: number
  description?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
  expiresAt: string
  respondedAt?: string
}

export type RequestStatus = 'QUOTE_PENDING' | 'QUOTED' | 'QUOTE_ACCEPTED' | 'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAID' | 'PAYMENT_DISPUTE' | 'CANCELLED'
export type TechnicianStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED'

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  moderationStatus: 'PENDING' | 'APPROVED' | 'FLAGGED' | 'BLOCKED'
  moderationReason?: string
  createdAt: string
  readAt?: string
}

export interface UserNotification {
  id: string
  title: string
  message: string
  type: 'NEW_REQUEST' | 'NEW_QUOTE' | 'QUOTE_ACCEPTED' | 'REQUEST_ACCEPTED'
    | 'QUOTE_REJECTED' | 'PAYMENT_PROOF_UPLOADED' | 'SERVICE_EVIDENCE_UPLOADED'
    | 'PAYMENT_PROOF_VERIFIED'
    | 'TECHNICIAN_ON_THE_WAY' | 'TECHNICIAN_ARRIVED' | 'SERVICE_STARTED'
    | 'SERVICE_COMPLETED' | 'NEW_CHAT_MESSAGE' | 'NEW_RATING' | 'SERVICE_STATUS_CHANGED'
    | 'LEGAL_ACCEPTANCE_REQUIRED' | 'CONTENT_MODERATION_ALERT' | 'CHAT_MODERATION_ALERT'
  read: boolean
  createdAt: string
  route?: string
  requestId?: string
}

export interface UnreadCount {
  count: number
}

export interface AdminDashboardSummary {
  users: number
  pendingTechnicians: number
  pendingVerifications: number
  payments: number
}

export interface TechnicianProfile {
  id: string
  userId: string
  fullName: string
  email: string
  documentNumber: string
  phone: string
  categories: ServiceCategory[]
  description: string
  latitude?: number
  longitude?: number
  status: TechnicianStatus
  profilePhotoUrl?: string
  documentPhotoUrl?: string
  profilePhotoFaceValidated?: boolean
  certificatePhotoUrl?: string
  workExperienceDescription: string
  averageRating: number
  completedServicesCount: number
  paidServicesCount: number
  verificationStatus: VerificationStatus
  homeAddress: string
  homeLatitude: number
  homeLongitude: number
  homeCity?: string
  homeNeighborhood?: string
  countryId?: string
  countryName?: string
  departmentId?: string
  departmentName?: string
  cityId?: string
  cityName?: string
}

export interface UserProfile {
  id: string
  fullName: string
  email: string
  phone?: string
  role: Role
  profilePhotoUrl?: string
  documentPhotoUrl?: string
  documentType?: 'CC' | 'PASSPORT'
  documentNumber?: string
  documentFrontUrl?: string
  documentBackUrl?: string
  documentSingleUrl?: string
  faceDetectionStatus?: 'AUTO_VALIDATED' | 'MANUAL_REVIEW_REQUIRED' | 'FAILED'
  identityDocumentCaptureStatus?: 'AUTO_CAPTURED' | 'MANUAL_CAPTURED' | 'MANUAL_REVIEW_REQUIRED'
  certificatePhotoUrl?: string
  workExperienceDescription?: string
  averageRating: number
  completedServicesCount: number
  paidServicesCount: number
  verificationStatus: VerificationStatus
  emailVerified: boolean
  phoneVerified: boolean
  documentsVerified: boolean
  profilePhotoFaceValidated?: boolean
  homeAddress?: string
  homeLatitude?: number
  homeLongitude?: number
  homeCity?: string
  homeNeighborhood?: string
  countryId?: string
  countryName?: string
  departmentId?: string
  departmentName?: string
  cityId?: string
  cityName?: string
}

export interface UserVerification {
  id: string
  fullName: string
  email: string
  role: Role
  verificationStatus: VerificationStatus
  profilePhotoUrl?: string
  documentPhotoUrl: string
  certificatePhotoUrl?: string
  workExperienceDescription?: string
  createdAt: string
  verifiedAt?: string
}

export interface Verifier {
  id: string
  fullName: string
  email: string
  createdAt: string
}

export interface Payment {
  paymentId: string
  serviceRequestId: string
  clientId: string
  clientName: string
  technicianId: string
  technicianName: string
  amount: number
  platformFee: number
  technicianAmount: number
  platformCommissionPercentage: number
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentMethod: 'CASH' | 'WOMPI' | 'MERCADO_PAGO' | 'PAYU'
  commissionWaived?: boolean
  commissionWaivedReason?: string
  referralRewardId?: string
  createdAt: string
}

export interface ReferralCode {
  id: string
  technicianId: string
  technicianName: string
  code: string
  active: boolean
  createdAt: string
  registered: number
  qualified: number
  availableRewards: number
  usedRewards: number
}

export interface ReferralRegistration {
  id: string
  referredUserId: string
  referredUserName: string
  referredUserRole: 'CLIENT' | 'TECHNICIAN'
  status: 'REGISTERED' | 'QUALIFIED' | 'REWARD_GRANTED' | 'CANCELLED'
  createdAt: string
  qualifiedAt?: string
  rewardGrantedAt?: string
}

export interface ReferralReward {
  id: string
  rewardType: 'FREE_COMMISSION_SERVICE'
  status: 'AVAILABLE' | 'USED' | 'EXPIRED' | 'CANCELLED'
  sourceServiceRequestId?: string
  usedServiceRequestId?: string
  createdAt: string
  usedAt?: string
  expiresAt?: string
}

export interface AppVersion {
  id: string
  platform: 'ANDROID' | 'IOS'
  minimumSupportedVersion: string
  latestVersion: string
  forceUpdate: boolean
  updateUrl: string
  message: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface TechnicianLocation {
  technicianId: string
  technicianName: string
  latitude: number
  longitude: number
  accuracy?: number
  speed?: number
  heading?: number
  online: boolean
  updatedAt: string
}

export interface SystemParameter {
  id: string
  key: string
  value: string
  description: string
  type: 'INTEGER' | 'DECIMAL' | 'BOOLEAN' | 'STRING'
  active: boolean
  updatedAt: string
}

export interface FinancialSummary {
  totalAmount: number
  totalPlatformFee: number
  totalTechnicianAmount: number
  paymentCount: number
  payments: Payment[]
}

export interface TechnicianWallet {
  walletId?: string
  technicianId: string
  technicianName: string
  technicianEmail: string
  technicianPhone?: string
  balance: number
  currency: string
  rechargeEnabled: boolean
  lowBalance: boolean
  blocked: boolean
  lowBalanceMinimum: number
  minRechargeAmount: number
  maxRechargeAmount: number
  totalApprovedRecharges: number
  totalCommissionDebits: number
  completedServicesCount: number
  updatedAt?: string
}

export interface TechnicianWalletTransaction {
  id: string
  type: 'RECHARGE_PENDING' | 'RECHARGE_APPROVED' | 'RECHARGE_REJECTED' | 'COMMISSION_DEBIT' | 'COMMISSION_REFUND' | 'ADMIN_ADJUSTMENT'
  amount: number
  balanceBefore: number
  balanceAfter: number
  reference?: string
  description?: string
  createdAt: string
}

export interface RechargeResponse {
  rechargeId: string
  paymentUrl: string
  reference: string
  amount: number
  currency: string
}
