import { RoleWorkspace } from '../shared/components/RoleWorkspace'
import { workflowPaths } from '../../routes/paths'

const links = [
  { to: workflowPaths.admin.overview, label: 'Resumen' },
  { to: workflowPaths.admin.verifications, label: 'Verificaciones' },
  { to: workflowPaths.admin.pendingVerifications, label: 'Pendientes por Verificación' },
  { to: workflowPaths.admin.categories, label: 'Categorías' },
  { to: workflowPaths.admin.finances, label: 'Finanzas' },
  { to: workflowPaths.admin.settings, label: 'Configuración' },
  { to: workflowPaths.admin.operations, label: 'Pagos y denuncias' },
  { to: workflowPaths.admin.users, label: 'Usuarios inactivos' },
  { to: workflowPaths.admin.legal, label: 'Documentos legales' },
  { to: workflowPaths.admin.referrals, label: 'Referidos' },
  { to: workflowPaths.admin.appVersions, label: 'Versiones de App' },
]

export function AdminWorkspace() {
  return <RoleWorkspace title="Centro de operaciones" subtitle="Panel administrador" links={links} />
}
