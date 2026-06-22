import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { installGeolocationMock } from '../../../test/browserMocks'
import { serviceRequestFixture, technicianProfileFixture } from '../../../test/fixtures'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { server } from '../../../test/server'
import { AvailableRequestsPage } from './AvailableRequestsPage'

const page = (content: unknown[]) => ({
  content, page: 0, size: 30, totalElements: content.length, totalPages: 1, hasNext: false,
})

describe('AvailableRequestsPage', () => {
  it('mantiene una cotización independiente por solicitud y envía la seleccionada', async () => {
    installGeolocationMock()
    const first = serviceRequestFixture({ id: 'request-1', description: 'Primera solicitud', distanceKm: 1.2 })
    const second = serviceRequestFixture({ id: 'request-2', description: 'Segunda solicitud', distanceKm: 2.4 })
    let quotePayload: Record<string, unknown> = {}
    let quotedRequest = ''
    server.use(
      http.get('*/v1/technicians/me', () => HttpResponse.json(technicianProfileFixture())),
      http.get('*/v1/service-requests/available/page', () => HttpResponse.json(page([first, second]))),
      http.put('*/v1/service-requests/:id/quote', async ({ params, request }) => {
        quotedRequest = String(params.id)
        quotePayload = await request.json() as Record<string, unknown>
        return HttpResponse.json({})
      }),
    )
    const { user } = renderWithProviders(<AvailableRequestsPage />)

    let firstCard = (await screen.findByText('Primera solicitud')).closest('article')!
    await user.click(within(firstCard).getByRole('button', { name: 'Ver recorrido aproximado' }))
    expect(within(firstCard).getByText(/destino mostrado es aproximado/i)).toBeInTheDocument()
    await user.click(within(firstCard).getByRole('button', { name: 'Ocultar recorrido' }))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Categoría' }),
      technicianProfileFixture().categories[0].id)
    firstCard = (await screen.findByText('Primera solicitud')).closest('article')!
    const secondCard = screen.getByText('Segunda solicitud').closest('article')!
    await user.type(within(firstCard).getByPlaceholderText('Tu cotización'), '120000')
    await user.type(within(firstCard).getByPlaceholderText('Descripción de la oferta (opcional)'), 'Incluye visita')
    await user.type(within(secondCard).getByPlaceholderText('Tu cotización'), '150000')

    expect(within(firstCard).getByPlaceholderText('Tu cotización')).toHaveValue(120000)
    expect(within(secondCard).getByPlaceholderText('Tu cotización')).toHaveValue(150000)
    await user.click(within(firstCard).getByRole('button', { name: 'Cotizar' }))

    await waitFor(() => expect(quotedRequest).toBe('request-1'))
    expect(quotePayload).toEqual({ technicianPrice: 120000, description: 'Incluye visita' })
  })
})
