export type DataRequestStatus = 'PENDING' | 'COMPLETED' | 'REJECTED'
export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED'
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface DataRequest {
  id: string
  userId: string
  userName: string
  type: 'EXPORT' | 'ANONYMIZATION'
  status: DataRequestStatus
  reason?: string
  requestedAt: string
  completedAt?: string
}

export interface RetentionPolicy {
  id: string
  dataCategory: string
  retentionDays: number
  legalBasis: string
  automaticDeletion: boolean
  active: boolean
  updatedAt: string
}

export interface ComplianceIncident {
  id: string
  title: string
  description: string
  severity: IncidentSeverity
  status: IncidentStatus
  detectedAt: string
  resolutionSummary?: string
}

export interface AccessAudit {
  id: string
  actorUserId?: string
  subjectUserId?: string
  resourceType: string
  resourceId?: string
  action: string
  outcome: 'SUCCESS' | 'DENIED' | 'FAILED'
  correlationId?: string
  createdAt: string
}

export interface DataExport {
  requestId: string
  generatedAt: string
  data: Record<string, unknown>
}
