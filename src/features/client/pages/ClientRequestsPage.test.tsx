import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { serviceQuoteFixture, serviceRequestFixture, sessionFixture } from '../../../test/fixtures'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { server } from '../../../test/server'
import { ClientRequestsPage } from './ClientRequestsPage'

vi.mock('../../service-support/ServiceSupportPanel', () => ({
  ServiceSupportPanel: () => <div>Soporte</div>,
}))

const page = (content: unknown[]) => ({
  content, page: 0, size: 20, totalElements: content.length, totalPages: 1, hasNext: false,
})

describe('ClientRequestsPage', () => {
  it('muestra y acepta una cotización', async () => {
    const request = serviceRequestFixture()
    const quote = serviceQuoteFixture()
    let acceptedQuoteId = ''
    server.use(
      http.get('*/v1/service-requests/my/page', () => HttpResponse.json(page([request]))),
      http.get(`*/v1/service-requests/${request.id}/quotes`, () => HttpResponse.json([quote])),
      http.put(`*/v1/service-requests/${request.id}/confirm-quote`, async ({ request: httpRequest }) => {
        acceptedQuoteId = ((await httpRequest.json()) as { quoteId: string }).quoteId
        return HttpResponse.json(serviceRequestFixture({ status: 'QUOTE_ACCEPTED' }))
      }),
    )
    const { user } = renderWithProviders(<ClientRequestsPage />, { session: sessionFixture() })

    await screen.findByText('Técnico TecnGo')
    expect(screen.getByText('$120.000 COP')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Aceptar' }))

    await waitFor(() => expect(acceptedQuoteId).toBe(quote.id))
  })

  it('cancela una solicitud activa', async () => {
    const request = serviceRequestFixture()
    let nextStatus = ''
    server.use(
      http.get('*/v1/service-requests/my/page', () => HttpResponse.json(page([request]))),
      http.get(`*/v1/service-requests/${request.id}/quotes`, () => HttpResponse.json([])),
      http.put(`*/v1/service-requests/${request.id}/status`, async ({ request: httpRequest }) => {
        nextStatus = ((await httpRequest.json()) as { status: string }).status
        return HttpResponse.json(serviceRequestFixture({ status: 'CANCELLED' }))
      }),
    )
    const { user } = renderWithProviders(<ClientRequestsPage />, { session: sessionFixture() })

    await screen.findByText('Revisar una instalación eléctrica')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    await waitFor(() => expect(nextStatus).toBe('CANCELLED'))
  })

  it('califica un servicio pagado y oculta el formulario al actualizar', async () => {
    const request = serviceRequestFixture({
      status: 'PAID',
      technicianId: 'technician-1',
      technicianName: 'Técnico TecnGo',
      finalPrice: 120_000,
    })
    let rating: Record<string, unknown> = {}
    server.use(
      http.get('*/v1/service-requests/my/page', () => HttpResponse.json(page([request]))),
      http.get(`*/v1/service-requests/${request.id}/quotes`, () => HttpResponse.json([])),
      http.get(`*/v1/service-requests/${request.id}/ratings/me`, () => HttpResponse.json({ rated: false })),
      http.post(`*/v1/service-requests/${request.id}/ratings`, async ({ request: httpRequest }) => {
        rating = await httpRequest.json() as Record<string, unknown>
        return HttpResponse.json({})
      }),
    )
    const { user } = renderWithProviders(<ClientRequestsPage />, { session: sessionFixture() })

    await screen.findByText('Califica al técnico')
    await user.selectOptions(screen.getByRole('combobox'), '4')
    await user.type(screen.getByPlaceholderText('Comentario opcional'), 'Buen servicio')
    await user.click(screen.getByRole('button', { name: 'Enviar calificación' }))

    await waitFor(() => expect(rating).toEqual({ score: 4, comment: 'Buen servicio' }))
    expect(screen.getByText('Calificación enviada.')).toBeInTheDocument()
  })
})
