import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sessionFixture } from '../test/fixtures'
import { server } from '../test/server'
import { sessionStorageKey } from '../context/sessionStorage'

const redirectBrowser = vi.fn()

vi.mock('./browserNavigation', () => ({ redirectBrowser }))

describe('seguridad del cliente API', () => {
  beforeEach(() => redirectBrowser.mockReset())

  it('envía el JWT y correlation ID cuando existe una sesión válida', async () => {
    localStorage.setItem(sessionStorageKey, JSON.stringify(sessionFixture({ token: 'jwt-prueba' })))
    let authorization = ''
    let correlationId = ''
    server.use(http.get('*/v1/security-probe', ({ request }) => {
      authorization = request.headers.get('authorization') ?? ''
      correlationId = request.headers.get('x-correlation-id') ?? ''
      return HttpResponse.json({ ok: true })
    }))
    const { api } = await import('./api')

    await api.get('/v1/security-probe')

    expect(authorization).toBe('Bearer jwt-prueba')
    expect(correlationId).not.toBe('')
  })

  it('elimina la sesión y redirige al login ante 401', async () => {
    localStorage.setItem(sessionStorageKey, JSON.stringify(sessionFixture()))
    server.use(http.get('*/v1/security-probe', () => HttpResponse.json({}, { status: 401 })))
    const { api } = await import('./api')

    await expect(api.get('/v1/security-probe')).rejects.toBeDefined()

    expect(localStorage.getItem(sessionStorageKey)).toBeNull()
    expect(redirectBrowser).toHaveBeenCalledWith('/login')
  })

  it.each([
    ['EMAIL_NOT_VERIFIED', '/app/confirmar-correo'],
    ['ONBOARDING_REQUIRED', '/app/onboarding'],
  ])('redirige el código %s al flujo correspondiente', async (code, path) => {
    server.use(http.get('*/v1/security-probe', () =>
      HttpResponse.json({ code }, { status: 403 })))
    const { api } = await import('./api')

    await expect(api.get('/v1/security-probe')).rejects.toBeDefined()

    expect(redirectBrowser).toHaveBeenCalledWith(path)
  })
})
