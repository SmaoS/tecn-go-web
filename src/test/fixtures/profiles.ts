import type { TechnicianProfile, UserProfile } from '../../types'

export function userProfileFixture(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    fullName: 'Cliente TecnGo',
    email: 'cliente@tecngo.test',
    role: 'CLIENT',
    averageRating: 5,
    completedServicesCount: 2,
    paidServicesCount: 2,
    verificationStatus: 'VERIFIED',
    emailVerified: true,
    phoneVerified: true,
    documentsVerified: true,
    homeAddress: 'Calle 10 # 20-30',
    homeCity: 'Villavicencio',
    countryId: '00000000-0000-0000-0000-000000000010',
    countryName: 'Colombia',
    departmentId: '00000000-0000-0000-0000-000000000020',
    departmentName: 'Meta',
    cityId: '00000000-0000-0000-0000-000000000300',
    cityName: 'Villavicencio',
    ...overrides,
  }
}

export function technicianProfileFixture(overrides: Partial<TechnicianProfile> = {}): TechnicianProfile {
  return {
    id: '00000000-0000-0000-0000-000000000600',
    userId: '00000000-0000-0000-0000-000000000002',
    fullName: 'Técnico TecnGo',
    email: 'tecnico@tecngo.test',
    documentNumber: '123456789',
    phone: '3001234567',
    categories: [{
      id: '00000000-0000-0000-0000-000000000200',
      name: 'Electricista',
      slug: 'electricista',
      description: 'Servicios eléctricos',
      active: true,
    }],
    description: 'Experiencia en instalaciones eléctricas',
    status: 'APPROVED',
    workExperienceDescription: 'Cinco años de experiencia',
    averageRating: 5,
    completedServicesCount: 8,
    paidServicesCount: 8,
    verificationStatus: 'VERIFIED',
    homeAddress: 'Calle 20 # 10-30',
    homeLatitude: 4.15,
    homeLongitude: -73.64,
    homeCity: 'Villavicencio',
    countryId: '00000000-0000-0000-0000-000000000010',
    countryName: 'Colombia',
    departmentId: '00000000-0000-0000-0000-000000000020',
    departmentName: 'Meta',
    cityId: '00000000-0000-0000-0000-000000000300',
    cityName: 'Villavicencio',
    ...overrides,
  }
}
