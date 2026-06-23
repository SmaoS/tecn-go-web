import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { installGeolocationMock } from '../../../test/browserMocks'
import { roleSessionFixture, serviceRequestFixture } from '../../../test/fixtures'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { server } from '../../../test/server'
import { AssignedServicesPage } from './AssignedServicesPage'

vi.mock('../../chat/ChatPanel', () => ({ ChatPanel: () => <div>Chat</div> }))

const page = (content: unknown[]) => ({
  content, page: 0, size: 20, totalElements: content.length, totalPages: 1, hasNext: false,
})

describe('AssignedServicesPage', () => {
  it('avanza el servicio al siguiente estado permitido', async () => {
    const request = serviceRequestFixture({
      status: 'QUOTE_ACCEPTED',
      technicianId: '00000000-0000-0000-0000-000000000002',
      technicianName: 'Técnico TecnGo',
    })
    let nextStatus = ''
    server.use(
      http.get('*/v1/service-requests/my-assigned/page', () => HttpResponse.json(page([request]))),
      http.put(`*/v1/service-requests/${request.id}/status`, async ({ request: httpRequest }) => {
        nextStatus = ((await httpRequest.json()) as { status: string }).status
        return HttpResponse.json(serviceRequestFixture({ ...request, status: 'ON_THE_WAY' }))
      }),
    )
    const { user } = renderWithProviders(<AssignedServicesPage />, {
      session: roleSessionFixture('TECHNICIAN'),
    })

    await screen.findByText('Revisar una instalación eléctrica')
    await user.click(screen.getByRole('button', { name: 'Voy en camino' }))

    await waitFor(() => expect(nextStatus).toBe('ON_THE_WAY'))
  })

  it('activa y desactiva el envío de ubicación', async () => {
    installGeolocationMock({ latitude: 4.17, longitude: -73.66 })
    const locations: Array<Record<string, unknown>> = []
    server.use(
      http.get('*/v1/service-requests/my-assigned/page', () => HttpResponse.json(page([]))),
      http.put('*/v1/technicians/me/location', async ({ request }) => {
        locations.push(await request.json() as Record<string, unknown>)
        return HttpResponse.json({})
      }),
    )
    const { user } = renderWithProviders(<AssignedServicesPage />, {
      session: roleSessionFixture('TECHNICIAN'),
    })

    await user.click(await screen.findByRole('button', { name: 'Activar ubicación' }))
    await waitFor(() => expect(locations[0]).toMatchObject({
      latitude: 4.17,
      longitude: -73.66,
      online: true,
    }))
    await user.click(screen.getByRole('button', { name: /Desactivar/ }))
    await waitFor(() => expect(locations.at(-1)).toMatchObject({ online: false }))
  })

  it('permite calificar al cliente después del pago', async () => {
    const request = serviceRequestFixture({
      status: 'PAID',
      technicianId: '00000000-0000-0000-0000-000000000002',
      technicianName: 'Técnico TecnGo',
    })
    let rating: Record<string, unknown> = {}
    vi.spyOn(window, 'prompt')
      .mockReturnValueOnce('4')
      .mockReturnValueOnce('Cliente puntual')
    server.use(
      http.get('*/v1/service-requests/my-assigned/page', () => HttpResponse.json(page([request]))),
      http.get(`*/v1/service-requests/${request.id}/ratings/me`, () => HttpResponse.json({ rated: false })),
      http.post(`*/v1/service-requests/${request.id}/ratings`, async ({ request: httpRequest }) => {
        rating = await httpRequest.json() as Record<string, unknown>
        return HttpResponse.json({})
      }),
    )
    const { user } = renderWithProviders(<AssignedServicesPage />, {
      session: roleSessionFixture('TECHNICIAN'),
    })

    await user.click(await screen.findByRole('button', { name: 'Calificar cliente' }))

    await waitFor(() => expect(rating).toEqual({ score: 4, comment: 'Cliente puntual' }))
  })
})
