import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { roleSessionFixture } from '../test/fixtures'
import { renderWithProviders } from '../test/renderWithProviders'
import type { Role } from '../types'
import { ProtectedRoute, RoleRoute, RoleRouter } from './ProtectedRoute'

function LocationRoutes({ role }: { role?: Role }) {
  return <Routes>
    <Route path="/login" element={<p>Login</p>} />
    <Route path="/app" element={<ProtectedRoute />}>
      <Route index element={<RoleRouter />} />
      <Route element={<RoleRoute role={role ?? 'CLIENT'} />}>
        <Route path="privado" element={<p>Contenido privado</p>} />
      </Route>
    </Route>
    <Route path="/app/cliente/solicitudes" element={<p>Inicio cliente</p>} />
    <Route path="/app/tecnico/disponibles" element={<p>Inicio técnico</p>} />
    <Route path="/app/verificador" element={<p>Inicio verificador</p>} />
    <Route path="/app/admin/resumen" element={<p>Inicio administrador</p>} />
  </Routes>
}

describe('rutas protegidas', () => {
  it('envía al login cuando no existe sesión', () => {
    renderWithProviders(<LocationRoutes />, { route: '/app/privado' })

    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('permite la ruta cuando el rol coincide', () => {
    renderWithProviders(<LocationRoutes role="CLIENT" />, {
      route: '/app/privado',
      session: roleSessionFixture('CLIENT'),
    })

    expect(screen.getByText('Contenido privado')).toBeInTheDocument()
  })

  it('impide acceder con un rol diferente', () => {
    renderWithProviders(<LocationRoutes role="ADMIN" />, {
      route: '/app/privado',
      session: roleSessionFixture('CLIENT'),
    })

    expect(screen.getByText('Inicio cliente')).toBeInTheDocument()
  })

  it.each([
    ['CLIENT', 'Inicio cliente'],
    ['TECHNICIAN', 'Inicio técnico'],
    ['VERIFIER', 'Inicio verificador'],
    ['ADMIN', 'Inicio administrador'],
  ] as const)('dirige %s a su página inicial', (role, expected) => {
    renderWithProviders(<LocationRoutes />, {
      route: '/app',
      session: roleSessionFixture(role),
    })

    expect(screen.getByText(expected)).toBeInTheDocument()
  })
})
