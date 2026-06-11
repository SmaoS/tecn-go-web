export type Role = 'CLIENT' | 'TECHNICIAN' | 'VERIFIER' | 'ADMIN'
export type VerificationStatus = 'CREATED' | 'PENDING_VERIFICATION' | 'VERIFIED'

export interface Session {
  token: string
  userId: string
  fullName: string
  email: string
  role: Role
  verificationStatus: VerificationStatus
  emailVerified: boolean
  phoneVerified: boolean
  documentsVerified: boolean
}

export interface ServiceCategory {
  id: string
  name: string
  slug: string
  description: string
  active: boolean
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
  status: RequestStatus
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
  price: number
  description?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  updatedAt: string
}

export type RequestStatus = 'QUOTE_PENDING' | 'QUOTED' | 'QUOTE_ACCEPTED' | 'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAID' | 'CANCELLED'
export type TechnicianStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED'

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  createdAt: string
  readAt?: string
}

export interface UserNotification {
  id: string
  title: string
  message: string
  type: 'NEW_REQUEST' | 'NEW_QUOTE' | 'QUOTE_ACCEPTED' | 'REQUEST_ACCEPTED'
    | 'TECHNICIAN_ON_THE_WAY' | 'TECHNICIAN_ARRIVED' | 'SERVICE_STARTED'
    | 'SERVICE_COMPLETED' | 'NEW_CHAT_MESSAGE' | 'NEW_RATING' | 'SERVICE_STATUS_CHANGED'
  read: boolean
  createdAt: string
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
  certificatePhotoUrl?: string
  workExperienceDescription: string
  averageRating: number
  completedServicesCount: number
  paidServicesCount: number
  verificationStatus: VerificationStatus
}

export interface UserProfile {
  id: string
  fullName: string
  email: string
  phone?: string
  role: Role
  profilePhotoUrl?: string
  documentPhotoUrl?: string
  certificatePhotoUrl?: string
  workExperienceDescription?: string
  averageRating: number
  completedServicesCount: number
  paidServicesCount: number
  verificationStatus: VerificationStatus
  emailVerified: boolean
  phoneVerified: boolean
  documentsVerified: boolean
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
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentMethod: 'CASH' | 'WOMPI' | 'MERCADO_PAGO' | 'PAYU'
  createdAt: string
}

export interface FinancialSummary {
  totalAmount: number
  totalPlatformFee: number
  totalTechnicianAmount: number
  paymentCount: number
  payments: Payment[]
}
