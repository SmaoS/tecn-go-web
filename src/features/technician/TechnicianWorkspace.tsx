import { RoleWorkspace } from '../shared/components/RoleWorkspace'
import { workflowPaths } from '../../routes/paths'

const links = [
  { to: workflowPaths.technician.available, label: 'Solicitudes disponibles' },
  { to: workflowPaths.technician.assigned, label: 'Servicios asignados' },
  { to: workflowPaths.technician.history, label: 'Historial de servicios' },
  { to: workflowPaths.technician.earnings, label: 'Ganancias' },
  { to: workflowPaths.technician.wallet, label: 'Mi saldo' },
  { to: workflowPaths.technician.referrals, label: 'Invita y gana' },
  { to: workflowPaths.technician.profile, label: 'Mi perfil' },
  { to: workflowPaths.technician.legal, label: 'Compromiso y términos' },
]

export function TechnicianWorkspace() {
  return <RoleWorkspace subtitle="Panel técnico" links={links} />
}
