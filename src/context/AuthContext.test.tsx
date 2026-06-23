import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'
import { sessionStorageKey } from './sessionStorage'
import { sessionFixture } from '../test/fixtures'
import { renderWithProviders } from '../test/renderWithProviders'
import { server } from '../test/server'

function AuthProbe() {
  const { session, setSession, logout } = useAuth()
  return <div>
    <p>{session?.fullName ?? 'Sin sesión'}</p>
    <button onClick={() => setSession(sessionFixture({ fullName: 'Nueva sesión' }))}>Guardar</button>
    <button onClick={() => void logout()}>Salir</button>
  </div>
}

function renderAuthProvider() {
  return renderWithProviders(<AuthProvider><AuthProbe /></AuthProvider>)
}

describe('AuthProvider', () => {
  it('restaura una sesión persistida', () => {
    localStorage.setItem(sessionStorageKey, JSON.stringify(sessionFixture({ fullName: 'Sesión persistida' })))

    renderAuthProvider()

    expect(screen.getByText('Sesión persistida')).toBeInTheDocument()
  })

  it('restaura el rol efectivo desde activeMode', () => {
    localStorage.setItem(sessionStorageKey, JSON.stringify(sessionFixture({
      role: 'TECHNICIAN',
      roles: ['CLIENT', 'TECHNICIAN'],
      activeMode: 'CLIENT',
      fullName: 'Sesión modo cliente',
    })))

    renderAuthProvider()

    expect(screen.getByText('Sesión modo cliente')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(sessionStorageKey) ?? '{}').role).toBe('CLIENT')
  })

  it('elimina una sesión inválida sin romper el arranque', () => {
    localStorage.setItem(sessionStorageKey, '{sesion-invalida')

    renderAuthProvider()

    expect(screen.getByText('Sin sesión')).toBeInTheDocument()
    expect(localStorage.getItem(sessionStorageKey)).toBeNull()
  })

  it('guarda la sesión actualizada', async () => {
    const { user } = renderAuthProvider()

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByText('Nueva sesión')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(sessionStorageKey) ?? '{}').fullName).toBe('Nueva sesión')
  })

  it('cierra la sesión local aunque el backend falle', async () => {
    localStorage.setItem(sessionStorageKey, JSON.stringify(sessionFixture()))
    server.use(http.post('*/v1/auth/logout', () => HttpResponse.json({}, { status: 503 })))
    const { user } = renderAuthProvider()

    await user.click(screen.getByRole('button', { name: 'Salir' }))

    await waitFor(() => expect(screen.getByText('Sin sesión')).toBeInTheDocument())
    expect(localStorage.getItem(sessionStorageKey)).toBeNull()
  })
})
