import { fireEvent, screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { roleSessionFixture } from '../../../test/fixtures'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { RoleWorkspace, type WorkspaceLink } from './RoleWorkspace'

vi.mock('../../notifications/NotificationCenter', () => ({
  NotificationCenter: () => <div>Centro de notificaciones</div>,
}))

const links: WorkspaceLink[] = [
  { to: '/panel/uno', label: 'Uno', primary: true },
  { to: '/panel/dos', label: 'Dos', primary: true },
  { to: '/panel/tres', label: 'Tres', primary: true },
  { to: '/panel/cuatro', label: 'Cuatro', primary: true },
  { to: '/panel/cinco', label: 'Cinco' },
  { to: '/panel/seis', label: 'Seis' },
]

function WorkspaceRoutes() {
  return <Routes>
    <Route path="/panel" element={<RoleWorkspace subtitle="Panel de prueba" links={links} />}>
      <Route path="uno" element={<p>Página uno</p>} />
      <Route path="cinco" element={<p>Página cinco</p>} />
    </Route>
  </Routes>
}

describe('RoleWorkspace', () => {
  it('muestra cuatro accesos principales y oculta los secundarios', () => {
    renderWithProviders(<WorkspaceRoutes />, {
      route: '/panel/uno',
      session: roleSessionFixture('CLIENT'),
    })

    expect(screen.getAllByRole('link')).toHaveLength(4)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /más/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('abre el menú vertical y navega cerrándolo', async () => {
    const { user } = renderWithProviders(<WorkspaceRoutes />, {
      route: '/panel/uno',
      session: roleSessionFixture('CLIENT'),
    })

    await user.click(screen.getByRole('button', { name: /más/i }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Cinco' })).toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: 'Cinco' }))
    expect(screen.getByText('Página cinco')).toBeInTheDocument()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('cierra con Escape y con clic fuera', async () => {
    const { user } = renderWithProviders(<WorkspaceRoutes />, {
      route: '/panel/uno',
      session: roleSessionFixture('CLIENT'),
    })
    const button = screen.getByRole('button', { name: /más/i })

    await user.click(button)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(button)
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('marca Más cuando la ruta secundaria está activa', () => {
    renderWithProviders(<WorkspaceRoutes />, {
      route: '/panel/cinco',
      session: roleSessionFixture('CLIENT'),
    })

    expect(screen.getByRole('button', { name: /más/i })).toHaveClass('border-brand-500')
  })
})
