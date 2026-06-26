import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { installGeolocationMock } from '../../../test/browserMocks'
import { serviceRequestFixture, userProfileFixture } from '../../../test/fixtures'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { server } from '../../../test/server'
import { CreateRequestPage } from './CreateRequestPage'

const category = {
  id: '00000000-0000-0000-0000-000000000200',
  name: 'Electricista',
  slug: 'electricista',
  description: 'Servicios eléctricos',
  active: true,
}

describe('CreateRequestPage', () => {
  it('bloquea la creación cuando el perfil no tiene ciudad', async () => {
    installGeolocationMock()
    server.use(
      http.get('*/v1/services', () => HttpResponse.json([category])),
      http.get('*/v1/users/me/profile', () => HttpResponse.json(userProfileFixture({
        cityId: undefined,
        cityName: undefined,
      }))),
    )

    renderWithProviders(<CreateRequestPage />)

    await screen.findByText('Completa la ciudad en Mi perfil antes de crear una solicitud.')
    expect(screen.getByRole('button', { name: 'Crear solicitud' })).toBeDisabled()
  })

  it('crea la solicitud usando ciudad del perfil y ubicación GPS', async () => {
    installGeolocationMock({ latitude: 4.16, longitude: -73.65 })
    let payload: Record<string, unknown> = {}
    server.use(
      http.get('*/v1/services', () => HttpResponse.json([category])),
      http.get('*/v1/users/me/profile', () => HttpResponse.json(userProfileFixture())),
      http.post('*/v1/service-requests', async ({ request }) => {
        payload = await request.json() as Record<string, unknown>
        return HttpResponse.json(serviceRequestFixture(), { status: 201 })
      }),
    )
    const { user } = renderWithProviders(<CreateRequestPage />)

    await screen.findByText('Electricista')
    await user.selectOptions(screen.getByRole('combobox', { name: '' }), category.id)
    await user.type(screen.getByPlaceholderText('Describe lo que necesitas'), 'Revisar tomacorriente')
    await user.type(screen.getByPlaceholderText('Dirección del servicio'), 'Calle 30 # 20-10')
    await user.type(screen.getByPlaceholderText('Presupuesto estimado (opcional)'), '50000')
    await user.click(screen.getByRole('button', { name: 'Crear solicitud' }))

    await screen.findByText('Solicitud creada y disponible para técnicos cercanos.')
    expect(payload).toMatchObject({
      categoryId: category.id,
      cityId: userProfileFixture().cityId,
      latitude: 4.16,
      longitude: -73.65,
      estimatedPrice: 50000,
      paymentMethod: 'CASH',
    })
  })
})
