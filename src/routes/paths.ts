import type { Role } from '../types'

export const roleHome: Record<Role, string> = {
  CLIENT: '/app/cliente/solicitudes',
  TECHNICIAN: '/app/tecnico/disponibles',
  VERIFIER: '/app/verificador',
  ADMIN: '/app/admin/resumen',
}

export const workflowPaths = {
  client: {
    requests: '/app/cliente/solicitudes',
    create: '/app/cliente/nueva',
    payments: '/app/cliente/pagos',
    profile: '/app/cliente/perfil',
    legal: '/app/cliente/legal',
  },
  technician: {
    assigned: '/app/tecnico/asignadas',
    available: '/app/tecnico/disponibles',
    earnings: '/app/tecnico/ganancias',
    profile: '/app/tecnico/perfil',
    legal: '/app/tecnico/legal',
    referrals: '/app/tecnico/referidos',
  },
  admin: {
    overview: '/app/admin/resumen',
    verifications: '/app/admin/verificaciones',
    categories: '/app/admin/categorias',
    finances: '/app/admin/finanzas',
    settings: '/app/admin/configuracion',
    operations: '/app/admin/operaciones',
    users: '/app/admin/usuarios',
    legal: '/app/admin/legal',
    referrals: '/app/admin/referidos',
    appVersions: '/app/admin/versiones-app',
  },
} as const
