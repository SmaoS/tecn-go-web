import type { Role } from '../types'

export const roleHome: Record<Role, string> = {
  CLIENT: '/app/cliente/solicitudes',
  TECHNICIAN: '/app/tecnico/disponibles',
  VERIFIER: '/app/verificador/identidades',
  ADMIN: '/app/admin/resumen',
}

export const workflowPaths = {
  client: {
    requests: '/app/cliente/solicitudes',
    history: '/app/cliente/historial',
    create: '/app/cliente/nueva',
    payments: '/app/cliente/pagos',
    profile: '/app/cliente/perfil',
    legal: '/app/cliente/legal',
    referrals: '/app/cliente/referidos',
    pqr: '/app/cliente/pqr',
  },
  technician: {
    assigned: '/app/tecnico/asignadas',
    history: '/app/tecnico/historial',
    available: '/app/tecnico/disponibles',
    earnings: '/app/tecnico/ganancias',
    wallet: '/app/tecnico/saldo',
    profile: '/app/tecnico/perfil',
    legal: '/app/tecnico/legal',
    referrals: '/app/tecnico/referidos',
    productivity: '/app/tecnico/productividad',
    pqr: '/app/tecnico/pqr',
  },
  admin: {
    overview: '/app/admin/resumen',
    verifications: '/app/admin/verificaciones',
    verificationIdentities: '/app/admin/verificaciones/identidades',
    verificationSelfies: '/app/admin/verificaciones/selfies',
    verificationTechnicians: '/app/admin/verificaciones/tecnicos',
    verificationDataExports: '/app/admin/verificaciones/exportacion-datos',
    verificationVerifiers: '/app/admin/verificaciones/verificadores',
    pendingVerifications: '/app/admin/pendientes-verificacion',
    categories: '/app/admin/categorias',
    finances: '/app/admin/finanzas',
    technicianWallets: '/app/admin/saldos-tecnicos',
    settings: '/app/admin/configuracion',
    operations: '/app/admin/operaciones',
    users: '/app/admin/usuarios',
    legal: '/app/admin/legal',
    referrals: '/app/admin/referidos',
    appVersions: '/app/admin/versiones-app',
    compliance: '/app/admin/cumplimiento',
  },
  verifier: {
    identities: '/app/verificador/identidades',
    selfies: '/app/verificador/selfies',
    dataExports: '/app/verificador/exportacion-datos',
    operations: '/app/verificador/moderacion',
  },
} as const
