import type { Role, Session } from '../../types'

const baseSession: Session = {
  token: 'test-token',
  userId: '00000000-0000-0000-0000-000000000001',
  fullName: 'Usuario TecnGo',
  email: 'usuario@tecngo.test',
  roles: ['CLIENT'],
  activeMode: 'CLIENT',
  role: 'CLIENT',
  verificationStatus: 'VERIFIED',
  emailVerified: true,
  phoneVerified: true,
  documentsVerified: true,
  onboardingCompleted: true,
}

export function sessionFixture(overrides: Partial<Session> = {}): Session {
  return { ...baseSession, ...overrides }
}

export function roleSessionFixture(role: Role, overrides: Partial<Session> = {}): Session {
  const mode = role === 'CLIENT' || role === 'TECHNICIAN' ? role : undefined
  return sessionFixture({
    role,
    roles: [role],
    activeMode: mode,
    ...overrides,
  })
}
