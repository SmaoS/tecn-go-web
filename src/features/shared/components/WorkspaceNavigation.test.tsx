import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdminWorkspace } from '../../admin/AdminWorkspace'
import { ClientWorkspace } from '../../client/ClientWorkspace'
import { TechnicianWorkspace } from '../../technician/TechnicianWorkspace'
import { roleSessionFixture } from '../../../test/fixtures'
import { renderWithProviders } from '../../../test/renderWithProviders'

vi.mock('../../notifications/NotificationCenter', () => ({
  NotificationCenter: () => <div>Centro de notificaciones</div>,
}))

describe('navegación por rol', () => {
  it('prioriza solicitudes, creación, pagos y perfil para cliente', async () => {
    const { user } = renderWithProviders(<ClientWorkspace />, {
      route: '/app/cliente/solicitudes',
      session: roleSessionFixture('CLIENT'),
    })

    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Mis solicitudes', 'Solicitar servicio', 'Pagos', 'Mi perfil',
    ])
    await user.click(screen.getByRole('button', { name: /más/i }))
    expect(screen.getByRole('menuitem', { name: 'Historial de solicitudes' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Invita amigos' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'PQR' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Seguridad y términos' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Modo técnico' })).toBeInTheDocument()
  })

  it('prioriza trabajo disponible y asignado para técnico', async () => {
    const { user } = renderWithProviders(<TechnicianWorkspace />, {
      route: '/app/tecnico/disponibles',
      session: roleSessionFixture('TECHNICIAN'),
    })

    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Solicitudes disponibles', 'Servicios asignados', 'Historial de servicios', 'Ganancias',
    ])
    await user.click(screen.getByRole('button', { name: /más/i }))
    expect(screen.getByRole('menuitem', { name: 'Mi saldo' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Productividad' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Invita conocidos' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'PQR' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Mi perfil' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Compromiso y términos' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Modo cliente' })).toBeInTheDocument()
  })

  it('mantiene visibles los cuatro flujos críticos de administración', async () => {
    const { user } = renderWithProviders(<AdminWorkspace />, {
      route: '/app/admin/resumen',
      session: roleSessionFixture('ADMIN'),
    })

    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Resumen', 'Verificaciones', 'Finanzas',
    ])
    await user.click(screen.getByRole('button', { name: /más/i }))
    expect(screen.getByRole('menuitem', { name: 'Categorías' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Configuración' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Cumplimiento' })).toBeInTheDocument()
  })
})
