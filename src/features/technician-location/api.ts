import { api } from '../../lib/api'
import type { TechnicianLocation } from '../../types'

export const technicianLocationApi = {
  byRequest: (requestId: string) => api.get<TechnicianLocation>(`/v1/service-requests/${requestId}/technician-location`).then(({ data }) => data),
}
