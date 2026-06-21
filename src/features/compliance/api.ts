import { api } from '../../lib/api'
import type {
  AccessAudit,
  ComplianceIncident,
  DataExport,
  DataRequest,
  IncidentSeverity,
  IncidentStatus,
  RetentionPolicy,
} from './types'

const root = '/v1/admin/compliance'

export const complianceApi = {
  exportMine: () => api.post<DataExport>('/v1/users/me/data-export').then(({ data }) => data),
  requestAnonymization: (reason: string) =>
    api.post<DataRequest>('/v1/users/me/data-anonymization', { reason }).then(({ data }) => data),
  dataRequests: () => api.get<DataRequest[]>(`${root}/data-requests`).then(({ data }) => data),
  approveAnonymization: (id: string) =>
    api.put<DataRequest>(`${root}/data-requests/${id}/approve-anonymization`).then(({ data }) => data),
  rejectRequest: (id: string, reason: string) =>
    api.put<DataRequest>(`${root}/data-requests/${id}/reject`, { reason }).then(({ data }) => data),
  policies: () => api.get<RetentionPolicy[]>(`${root}/retention-policies`).then(({ data }) => data),
  updatePolicy: (item: RetentionPolicy) => api.put<RetentionPolicy>(
    `${root}/retention-policies/${item.dataCategory}`,
    {
      retentionDays: item.retentionDays,
      legalBasis: item.legalBasis,
      automaticDeletion: item.automaticDeletion,
      active: item.active,
    },
  ).then(({ data }) => data),
  runRetention: () => api.post<Record<string, number>>(`${root}/retention/run`).then(({ data }) => data),
  incidents: () => api.get<ComplianceIncident[]>(`${root}/incidents`).then(({ data }) => data),
  createIncident: (value: {
    title: string
    description: string
    severity: IncidentSeverity
  }) => api.post<ComplianceIncident>(`${root}/incidents`, value).then(({ data }) => data),
  updateIncident: (id: string, status: IncidentStatus, severity: IncidentSeverity, resolutionSummary?: string) =>
    api.put<ComplianceIncident>(`${root}/incidents/${id}`, {
      status, severity, resolutionSummary,
    }).then(({ data }) => data),
  audits: () => api.get<AccessAudit[]>(`${root}/access-audits?limit=100`).then(({ data }) => data),
}
