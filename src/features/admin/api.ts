import { api } from '../../lib/api'
import type {
  AdminDashboardSummary,
  FinancialSummary,
  ServiceCategory,
  SystemParameter,
  TechnicianLocation,
  TechnicianProfile,
} from '../../types'

export const adminApi = {
  pendingTechnicians: () => api.get<TechnicianProfile[]>('/v1/admin/technicians/pending').then(({ data }) => data),
  categories: () => api.get<ServiceCategory[]>('/v1/admin/service-categories').then(({ data }) => data),
  finances: () => api.get<FinancialSummary>('/v1/admin/payments').then(({ data }) => data),
  summary: () => api.get<AdminDashboardSummary>('/v1/admin/dashboard').then(({ data }) => data),
  parameters: () => api.get<SystemParameter[]>('/v1/admin/system-parameters').then(({ data }) => data),
  locations: () => api.get<TechnicianLocation[]>('/v1/admin/technicians/locations').then(({ data }) => data),
  reviewTechnician: (id: string, decision: 'approve' | 'reject') => api.put(`/v1/admin/technicians/${id}/${decision}`),
  createCategory: (value: { name: string; description: string; active: boolean }) =>
    api.post('/v1/admin/service-categories', value),
  updateCategory: (category: Pick<ServiceCategory, 'id' | 'name' | 'description' | 'active'>) =>
    api.put(`/v1/admin/service-categories/${category.id}`, {
      name: category.name, description: category.description, active: category.active,
    }),
  deleteCategory: (id: string) => api.delete(`/v1/admin/service-categories/${id}`),
  updateParameter: (key: string, value: string) => api.put(`/v1/admin/system-parameters/${key}`, { value }),
  evidence: (url: string) => api.get(url, { responseType: 'blob' }).then(({ data }) => data),
}
