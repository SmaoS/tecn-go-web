import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { notificationFixture, roleSessionFixture } from '../../test/fixtures'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { NotificationCenter } from './NotificationCenter'

function NotificationRoutes() {
  return <Routes>
    <Route path="*" element={<>
      <NotificationCenter />
      <Routes>
        <Route path="/app/cliente/solicitudes" element={<p>Solicitudes cliente</p>} />
        <Route path="/app/tecnico/disponibles" element={<p>Disponibles técnico</p>} />
        <Route path="/app/tecnico/legal" element={<p>Legal técnico</p>} />
      </Routes>
    </>} />
  </Routes>
}

describe('NotificationCenter', () => {
  it('marca como leída y navega al flujo del cliente', async () => {
    const notification = notificationFixture()
    let readId = ''
    server.use(
      http.get('*/v1/notifications', () => HttpResponse.json([notification])),
      http.get('*/v1/notifications/unread-count', () => HttpResponse.json({ count: 1 })),
      http.put('*/v1/notifications/:id/read', ({ params }) => {
        readId = String(params.id)
        return HttpResponse.json({})
      }),
    )
    const { user } = renderWithProviders(<NotificationRoutes />, {
      route: '/panel',
      session: roleSessionFixture('CLIENT'),
    })

    await user.click(await screen.findByRole('button', { name: /Notificaciones 1/i }))
    await user.click(await screen.findByText(notification.message))

    await screen.findByText('Solicitudes cliente')
    await waitFor(() => expect(readId).toBe(notification.id))
  })

  it('elimina una notificación del listado', async () => {
    const notification = notificationFixture()
    let deletedId = ''
    server.use(
      http.get('*/v1/notifications', () => HttpResponse.json([notification])),
      http.get('*/v1/notifications/unread-count', () => HttpResponse.json({ count: 1 })),
      http.delete('*/v1/notifications/:id', ({ params }) => {
        deletedId = String(params.id)
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const { user } = renderWithProviders(<NotificationCenter />, {
      session: roleSessionFixture('CLIENT'),
    })

    await user.click(await screen.findByRole('button', { name: /Notificaciones 1/i }))
    await screen.findByText(notification.message)
    await user.click(screen.getByRole('button', { name: 'Eliminar notificación' }))

    await waitFor(() => expect(deletedId).toBe(notification.id))
    await waitFor(() => expect(screen.queryByText(notification.message)).not.toBeInTheDocument())
  })

  it('lleva al técnico a solicitudes disponibles desde una solicitud nueva', async () => {
    const notification = notificationFixture({
      type: 'NEW_REQUEST',
      route: 'AvailableRequests',
      read: true,
    })
    server.use(
      http.get('*/v1/notifications', () => HttpResponse.json([notification])),
      http.get('*/v1/notifications/unread-count', () => HttpResponse.json({ count: 0 })),
    )
    const { user } = renderWithProviders(<NotificationRoutes />, {
      route: '/panel',
      session: roleSessionFixture('TECHNICIAN'),
    })

    await user.click(await screen.findByRole('button', { name: 'Notificaciones' }))
    await user.click(await screen.findByText(notification.message))

    expect(await screen.findByText('Disponibles técnico')).toBeInTheDocument()
  })

  it('abre los documentos legales del técnico', async () => {
    const notification = notificationFixture({
      type: 'LEGAL_ACCEPTANCE_REQUIRED',
      route: 'Legal',
      read: true,
    })
    server.use(
      http.get('*/v1/notifications', () => HttpResponse.json([notification])),
      http.get('*/v1/notifications/unread-count', () => HttpResponse.json({ count: 0 })),
    )
    const { user } = renderWithProviders(<NotificationRoutes />, {
      route: '/panel',
      session: roleSessionFixture('TECHNICIAN'),
    })

    await user.click(await screen.findByRole('button', { name: 'Notificaciones' }))
    await user.click(await screen.findByText(notification.message))

    expect(await screen.findByText('Legal técnico')).toBeInTheDocument()
  })
})
