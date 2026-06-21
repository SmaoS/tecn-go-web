import { describe, expect, it } from 'vitest'
import { statusLabels } from './status'

describe('statusLabels', () => {
  it('presenta estados técnicos en español', () => {
    expect(statusLabels.QUOTE_PENDING).toBe('Esperando cotización')
    expect(statusLabels.IN_PROGRESS).toBe('En progreso')
    expect(statusLabels.PAYMENT_DISPUTE).toBe('Pago en disputa')
    expect(statusLabels.CANCELLED).toBe('Cancelada')
  })
})
