import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { VerificationQueue, VerifierManager } from './components'

vi.mock('../../components/PrivateImage', () => ({
  PrivateImage: ({ alt }: { alt: string }) => <div>{alt}</div>,
}))
vi.mock('../catalogs/GeographicFields', () => ({
  GeographicFields: ({ onChange }: {
    onChange: (value: { countryId: string; departmentId: string; cityId: string; cityName: string }) => void
  }) => <button type="button" onClick={() => onChange({
    countryId: 'country-1',
    departmentId: 'department-1',
    cityId: 'city-1',
    cityName: 'Villavicencio',
  })}>Seleccionar ubicación</button>,
}))

describe('VerificationQueue', () => {
  it('muestra evidencias y aprueba una identidad pendiente', async () => {
    let verifiedId = ''
    server.use(
      http.get('*/v1/verifications/pending', () => HttpResponse.json([{
        id: 'user-1',
        fullName: 'Usuario pendiente',
        email: 'pendiente@tecngo.test',
        role: 'CLIENT',
        verificationStatus: 'PENDING_VERIFICATION',
        profilePhotoUrl: '/v1/files/profile',
        documentPhotoUrl: '/v1/files/document',
        createdAt: '2026-06-22T12:00:00Z',
      }])),
      http.put('*/v1/verifications/:id/verify', ({ params }) => {
        verifiedId = String(params.id)
        return HttpResponse.json({})
      }),
    )
    const { user } = renderWithProviders(<VerificationQueue />)

    await screen.findByText('Usuario pendiente')
    expect(screen.getAllByText('Documento')).toHaveLength(2)
    expect(screen.getAllByText('Foto de perfil')).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: 'Marcar verificado' }))

    await waitFor(() => expect(verifiedId).toBe('user-1'))
  })

  it('valida la foto de perfil y permite revisar la miniatura', async () => {
    let photoVerified = false
    server.use(
      http.get('*/v1/verifications/pending', () => HttpResponse.json([{
        id: 'user-1',
        fullName: 'Usuario pendiente',
        email: 'pendiente@tecngo.test',
        role: 'CLIENT',
        verificationStatus: 'PENDING_VERIFICATION',
        profilePhotoUrl: '/v1/files/profile',
        documentPhotoUrl: '/v1/files/document',
        createdAt: '2026-06-22T12:00:00Z',
      }])),
      http.put('*/v1/verifications/user-1/profile-photo/verify', () => {
        photoVerified = true
        return HttpResponse.json({})
      }),
    )
    const { user } = renderWithProviders(<VerificationQueue />)

    await user.click(await screen.findByRole('button', { name: 'Foto de perfil' }))
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    await user.click(screen.getByRole('button', { name: 'Validar rostro visible' }))

    await waitFor(() => expect(photoVerified).toBe(true))
  })

  it('crea una cuenta de verificador con ubicación', async () => {
    let payload: Record<string, unknown> = {}
    server.use(
      http.get('*/v1/admin/verifiers', () => HttpResponse.json([])),
      http.post('*/v1/admin/verifiers', async ({ request }) => {
        payload = await request.json() as Record<string, unknown>
        return HttpResponse.json({}, { status: 201 })
      }),
    )
    const { user } = renderWithProviders(<VerifierManager />)

    await user.type(await screen.findByPlaceholderText('Nombre completo'), 'Verificador TecnGo')
    await user.type(screen.getByPlaceholderText('Correo'), 'verificador@tecngo.test')
    await user.type(screen.getByPlaceholderText('Contraseña temporal'), 'Temporal123!')
    await user.click(screen.getByRole('button', { name: 'Seleccionar ubicación' }))
    await user.type(screen.getByPlaceholderText('Dirección domicilio'), 'Calle 10 # 20-30')
    await user.type(screen.getByPlaceholderText('Barrio'), 'Centro')
    await user.click(screen.getByRole('button', { name: 'Crear verificador' }))

    await waitFor(() => expect(payload).toMatchObject({
      fullName: 'Verificador TecnGo',
      email: 'verificador@tecngo.test',
      countryId: 'country-1',
      departmentId: 'department-1',
      cityId: 'city-1',
      homeCity: 'Villavicencio',
    }))
  })
})
