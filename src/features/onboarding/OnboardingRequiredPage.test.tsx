import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { imageFileFixture } from '../../test/browserMocks'
import { roleSessionFixture } from '../../test/fixtures'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { OnboardingRequiredPage } from './OnboardingRequiredPage'

const uploadFileMock = vi.hoisted(() => vi.fn())
vi.mock('../../lib/files', () => ({ uploadFile: uploadFileMock }))
vi.mock('../catalogs/GeographicFields', () => ({
  GeographicFields: ({ onChange }: {
    onChange: (value: { countryId: string; departmentId: string; cityId: string }) => void
  }) => <button type="button" onClick={() => onChange({
    countryId: 'country-1',
    departmentId: 'department-1',
    cityId: 'city-1',
  })}>Seleccionar ubicación</button>,
}))

describe('OnboardingRequiredPage', () => {
  const status = (currentStep: string) => ({
    emailVerified: true,
    phoneVerified: true,
    onboardingCompleted: false,
    currentStep,
    requiredSteps: [currentStep],
  })

  it('guarda los datos principales y la selección geográfica', async () => {
    let payload: Record<string, unknown> = {}
    server.use(
      http.get('*/v1/users/me/onboarding-status', () => HttpResponse.json({
        ...status('MAIN_DATA'),
      })),
      http.put('*/v1/users/me/onboarding/main-data', async ({ request }) => {
        payload = await request.json() as Record<string, unknown>
        return HttpResponse.json({
          emailVerified: true,
          phoneVerified: true,
          onboardingCompleted: false,
          currentStep: 'LEGAL_ACCEPTANCE',
          requiredSteps: ['LEGAL_ACCEPTANCE'],
        })
      }),
    )
    const { user } = renderWithProviders(<OnboardingRequiredPage />, {
      session: roleSessionFixture('CLIENT', { fullName: 'Cliente inicial' }),
    })

    const fullName = await screen.findByPlaceholderText('Nombre completo')
    await user.clear(fullName)
    await user.type(screen.getByPlaceholderText('Nombre completo'), 'Cliente actualizado')
    await user.type(screen.getByPlaceholderText('Teléfono'), '3001234567')
    await user.click(screen.getByRole('button', { name: 'Seleccionar ubicación' }))
    await user.type(screen.getByPlaceholderText('Dirección'), 'Calle 10 # 20-30')
    await user.type(screen.getByPlaceholderText('Número de documento'), '123456789')
    await user.click(screen.getByRole('button', { name: 'Guardar y continuar' }))

    await waitFor(() => expect(payload).toMatchObject({
      fullName: 'Cliente actualizado',
      phone: '3001234567',
      countryId: 'country-1',
      departmentId: 'department-1',
      cityId: 'city-1',
      documentType: 'CC',
      documentNumber: '123456789',
    }))
  })

  it('acepta los documentos legales', async () => {
    let accepted = false
    server.use(
      http.get('*/v1/users/me/onboarding-status', () => HttpResponse.json(status('LEGAL_ACCEPTANCE'))),
      http.post('*/v1/users/me/onboarding/legal-acceptance', () => {
        accepted = true
        return HttpResponse.json(status('PROFILE_SELFIE'))
      }),
    )
    const { user } = renderWithProviders(<OnboardingRequiredPage />, {
      session: roleSessionFixture('CLIENT'),
    })

    await user.click(await screen.findByRole('button', { name: 'Aceptar y continuar' }))

    await waitFor(() => expect(accepted).toBe(true))
  })

  it('carga y guarda la selfie para revisión manual', async () => {
    let selfie: Record<string, unknown> = {}
    uploadFileMock.mockResolvedValue('/v1/files/selfie')
    server.use(
      http.get('*/v1/users/me/onboarding-status', () => HttpResponse.json(status('PROFILE_SELFIE'))),
      http.post('*/v1/users/me/onboarding/profile-selfie', async ({ request }) => {
        selfie = await request.json() as Record<string, unknown>
        return HttpResponse.json(status('IDENTITY_DOCUMENT'))
      }),
    )
    const { user, container } = renderWithProviders(<OnboardingRequiredPage />, {
      session: roleSessionFixture('CLIENT'),
    })

    await screen.findByText(/Carga una foto clara de tu rostro/)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, imageFileFixture('selfie.jpg'))
    await user.click(await screen.findByRole('button', { name: 'Guardar selfie' }))

    await waitFor(() => expect(selfie).toEqual({
      profilePhotoUrl: '/v1/files/selfie',
      faceDetectionStatus: 'MANUAL_REVIEW_REQUIRED',
    }))
  })

  it('carga frente y reverso del documento', async () => {
    let document: Record<string, unknown> = {}
    uploadFileMock
      .mockResolvedValueOnce('/v1/files/document-1')
      .mockResolvedValueOnce('/v1/files/document-2')
    server.use(
      http.get('*/v1/users/me/onboarding-status', () => HttpResponse.json(status('IDENTITY_DOCUMENT'))),
      http.post('*/v1/users/me/onboarding/identity-document', async ({ request }) => {
        document = await request.json() as Record<string, unknown>
        return HttpResponse.json(status('COMPLETED'))
      }),
    )
    const { user, container } = renderWithProviders(<OnboardingRequiredPage />, {
      session: roleSessionFixture('CLIENT'),
    })

    await screen.findByText(/Carga frente y reverso/)
    const inputs = [...container.querySelectorAll('input[type="file"]')] as HTMLInputElement[]
    await user.upload(inputs[0], imageFileFixture('front.jpg'))
    await user.upload(inputs[1], imageFileFixture('back.jpg'))
    const saveDocument = screen.getByRole('button', { name: 'Guardar documento' })
    await waitFor(() => expect(saveDocument).toBeEnabled())
    await user.click(saveDocument)

    await waitFor(() => expect(document).toMatchObject({
      documentType: 'CC',
      documentFrontUrl: '/v1/files/document-1',
      documentBackUrl: '/v1/files/document-2',
    }))
  })

  it('guarda el perfil profesional del técnico', async () => {
    let professional: Record<string, unknown> = {}
    server.use(
      http.get('*/v1/users/me/onboarding-status', () =>
        HttpResponse.json(status('TECHNICIAN_PROFESSIONAL_PROFILE'))),
      http.get('*/v1/service-categories', () => HttpResponse.json([{
        id: 'category-1',
        name: 'Electricista',
        slug: 'electricista',
        description: 'Servicios eléctricos',
        active: true,
      }])),
      http.put('*/v1/technicians/me/onboarding/professional-profile', async ({ request }) => {
        professional = await request.json() as Record<string, unknown>
        return HttpResponse.json(status('TECHNICIAN_CERTIFICATE'))
      }),
    )
    const { user } = renderWithProviders(<OnboardingRequiredPage />, {
      session: roleSessionFixture('TECHNICIAN'),
    })

    await user.click(await screen.findByRole('checkbox', { name: /Electricista/ }))
    await user.type(screen.getByPlaceholderText('Describe tu experiencia'),
      'Tengo cinco años de experiencia en instalaciones eléctricas.')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() => expect(professional).toMatchObject({
      categoryIds: ['category-1'],
      workExperienceDescription: 'Tengo cinco años de experiencia en instalaciones eléctricas.',
    }))
  })

  it('permite continuar sin certificado', async () => {
    let skipped = false
    server.use(
      http.get('*/v1/users/me/onboarding-status', () =>
        HttpResponse.json(status('TECHNICIAN_CERTIFICATE'))),
      http.post('*/v1/technicians/me/onboarding/skip-certificate', () => {
        skipped = true
        return HttpResponse.json(status('COMPLETED'))
      }),
    )
    const { user } = renderWithProviders(<OnboardingRequiredPage />, {
      session: roleSessionFixture('TECHNICIAN'),
    })

    await user.click(await screen.findByRole('button', { name: 'No tengo certificado ahora' }))

    await waitFor(() => expect(skipped).toBe(true))
  })
})
