import { RoleWorkspace } from '../shared/components/RoleWorkspace'
import { workflowPaths } from '../../routes/paths'

const links = [
  { to: workflowPaths.admin.overview, label: 'Resumen' },
  { to: workflowPaths.admin.verifications, label: 'Verificaciones' },
  { to: workflowPaths.admin.categories, label: 'Categorías' },
  { to: workflowPaths.admin.finances, label: 'Finanzas' },
  { to: workflowPaths.admin.settings, label: 'Configuración' },
]

export function AdminWorkspace() {
  return <RoleWorkspace title="Centro de operaciones" subtitle="Panel administrador" links={links} />
}
