import { describe, expect, it } from 'vitest'
import type { UserNotification } from '../../types'
import { notificationTitle } from './labels'

const notification = (type: UserNotification['type'], title = 'Título original'): UserNotification => ({
  id: 'notification-1',
  title,
  message: 'Mensaje',
  type,
  read: false,
  createdAt: '2026-06-21T12:00:00Z',
})

describe('notificationTitle', () => {
  it('usa una etiqueta clara para eventos conocidos', () => {
    expect(notificationTitle(notification('NEW_QUOTE'))).toBe('Nueva cotización recibida')
  })

  it('conserva el título recibido para eventos sin etiqueta', () => {
    expect(notificationTitle(notification('CONTENT_MODERATION_ALERT'))).toBe('Título original')
  })
})
