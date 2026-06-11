import { RoleWorkspace } from '../shared/components/RoleWorkspace'
import { workflowPaths } from '../../routes/paths'

const links = [
  { to: workflowPaths.technician.assigned, label: 'Servicios asignados' },
  { to: workflowPaths.technician.available, label: 'Solicitudes disponibles' },
  { to: workflowPaths.technician.earnings, label: 'Ganancias' },
  { to: workflowPaths.technician.profile, label: 'Mi perfil' },
]

export function TechnicianWorkspace() {
  return <RoleWorkspace subtitle="Panel técnico" links={links} />
}
