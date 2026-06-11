import { describe, expect, it } from 'vitest'
import { roleHome, workflowPaths } from './paths'

describe('rutas por rol', () => {
  it('envía cada rol a un flujo autorizado', () => {
    expect(roleHome.CLIENT).toBe(workflowPaths.client.requests)
    expect(roleHome.TECHNICIAN).toBe(workflowPaths.technician.assigned)
    expect(roleHome.ADMIN).toBe(workflowPaths.admin.overview)
    expect(roleHome.VERIFIER).toBe('/app/verificador')
  })
})
