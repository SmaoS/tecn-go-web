import { RoleWorkspace } from '../shared/components/RoleWorkspace'
import { workflowPaths } from '../../routes/paths'

const links = [
  { to: workflowPaths.client.requests, label: 'Mis solicitudes' },
  { to: workflowPaths.client.create, label: 'Solicitar servicio' },
  { to: workflowPaths.client.payments, label: 'Pagos' },
  { to: workflowPaths.client.profile, label: 'Mi perfil' },
  { to: workflowPaths.client.legal, label: 'Seguridad y términos' },
]

export function ClientWorkspace() {
  return <RoleWorkspace subtitle="Panel cliente" links={links} />
}
