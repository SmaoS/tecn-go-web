import { RoleWorkspace } from '../shared/components/RoleWorkspace'
import { workflowPaths } from '../../routes/paths'

const links = [
  { to: workflowPaths.admin.overview, label: 'Resumen', primary: true },
  { to: workflowPaths.admin.verifications, label: 'Verificaciones', primary: true },
  { to: workflowPaths.admin.categories, label: 'Categorías' },
  { to: workflowPaths.admin.finances, label: 'Finanzas', primary: true },
  { to: workflowPaths.admin.technicianWallets, label: 'Saldos técnicos' },
  { to: workflowPaths.admin.settings, label: 'Configuración' },
  { to: workflowPaths.admin.operations, label: 'Pagos y denuncias' },
  { to: workflowPaths.admin.users, label: 'Usuarios' },
  { to: workflowPaths.admin.legal, label: 'Documentos legales' },
  { to: workflowPaths.admin.referrals, label: 'Referidos' },
  { to: workflowPaths.admin.appVersions, label: 'Versiones de App' },
  { to: workflowPaths.admin.compliance, label: 'Cumplimiento' },
]

export function AdminWorkspace() {
  return <RoleWorkspace title="Centro de operaciones" subtitle="Panel administrador" links={links} />
}
