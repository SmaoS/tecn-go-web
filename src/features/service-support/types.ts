export type EvidenceType = 'BEFORE_SERVICE' | 'DURING_SERVICE' | 'AFTER_SERVICE' | 'PAYMENT_PROOF' | 'DAMAGE_REPORT' | 'OTHER'
export type ProofMethod = 'CASH' | 'TRANSFER' | 'WOMPI' | 'MERCADO_PAGO' | 'PAYU' | 'OTHER'

export interface ServiceEvidence {
  id: string
  serviceRequestId: string
  uploadedByName: string
  evidenceType: EvidenceType
  fileUrl: string
  description?: string
  createdAt: string
}

export interface PaymentProof {
  id: string
  serviceRequestId: string
  uploadedByName: string
  fileUrl: string
  amount: number
  paymentMethod: ProofMethod
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'
  reviewComment?: string
  createdAt: string
}

export interface UserReport {
  id: string
  serviceRequestId: string
  reporterName: string
  reportedUserId: string
  reportedName: string
  reason: string
  description: string
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  resolutionComment?: string
}
