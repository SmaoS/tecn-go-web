import type { RequestStatus } from '../../types'

export const statusLabels: Record<RequestStatus, string> = {
  QUOTE_PENDING: 'Esperando cotización',
  QUOTED: 'Cotizada',
  QUOTE_ACCEPTED: 'Cotización aceptada',
  ON_THE_WAY: 'En camino',
  ARRIVED: 'Técnico llegó',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada',
  PAID: 'Pagada',
  CANCELLED: 'Cancelada',
}
