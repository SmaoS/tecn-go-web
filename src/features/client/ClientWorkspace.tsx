import { RoleWorkspace } from '../shared/components/RoleWorkspace'
import { workflowPaths } from '../../routes/paths'

const links = [
  { to: workflowPaths.client.requests, label: 'Mis solicitudes', primary: true },
  { to: workflowPaths.client.create, label: 'Solicitar servicio', primary: true },
  { to: workflowPaths.client.payments, label: 'Pagos', primary: true },
  { to: workflowPaths.client.profile, label: 'Mi perfil', primary: true },
  { to: workflowPaths.client.history, label: 'Historial de solicitudes' },
  { to: workflowPaths.client.legal, label: 'Seguridad y términos' },

]

export function ClientWorkspace() {
  return <RoleWorkspace subtitle="Panel cliente" links={links} />
}
