import type { UserNotification } from '../../types'

export function notificationFixture(overrides: Partial<UserNotification> = {}): UserNotification {
  return {
    id: '00000000-0000-0000-0000-000000000500',
    title: 'Nueva cotización recibida',
    message: 'Técnico TecnGo cotizó $120.000 COP para tu solicitud Electricista',
    type: 'NEW_QUOTE',
    read: false,
    createdAt: '2026-06-22T12:10:00Z',
    route: 'RequestDetail',
    requestId: '00000000-0000-0000-0000-000000000100',
    ...overrides,
  }
}
