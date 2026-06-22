import type { ServiceQuote, ServiceRequest } from '../../types'

export function serviceRequestFixture(overrides: Partial<ServiceRequest> = {}): ServiceRequest {
  return {
    id: '00000000-0000-0000-0000-000000000100',
    clientId: '00000000-0000-0000-0000-000000000001',
    clientName: 'Cliente TecnGo',
    clientAverageRating: 5,
    clientPaidServicesCount: 2,
    technicianCompletedServicesCount: 0,
    technicianCategories: [],
    categoryId: '00000000-0000-0000-0000-000000000200',
    categoryName: 'Electricista',
    description: 'Revisar una instalación eléctrica',
    address: 'Zona aproximada, Villavicencio',
    latitude: 4.142,
    longitude: -73.626,
    locationPrecision: 'APPROXIMATE',
    estimatedPrice: 100_000,
    requestedPaymentMethod: 'CASH',
    status: 'QUOTE_PENDING',
    createdAt: '2026-06-22T12:00:00Z',
    serviceImagesCount: 0,
    images: [],
    cityId: '00000000-0000-0000-0000-000000000300',
    cityName: 'Villavicencio',
    ...overrides,
  }
}

export function serviceQuoteFixture(overrides: Partial<ServiceQuote> = {}): ServiceQuote {
  return {
    id: '00000000-0000-0000-0000-000000000400',
    serviceRequestId: '00000000-0000-0000-0000-000000000100',
    technicianId: '00000000-0000-0000-0000-000000000002',
    technicianName: 'Técnico TecnGo',
    technicianAverageRating: 5,
    technicianCompletedServicesCount: 8,
    technicianCategories: [],
    certifiedTechnician: true,
    price: 120_000,
    description: 'Incluye materiales básicos',
    status: 'PENDING',
    createdAt: '2026-06-22T12:05:00Z',
    updatedAt: '2026-06-22T12:05:00Z',
    expiresAt: '2026-06-23T12:05:00Z',
    ...overrides,
  }
}
