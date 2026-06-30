import { RoleWorkspace } from '../shared/components/RoleWorkspace'
import { workflowPaths } from '../../routes/paths'

const links = [
  { to: workflowPaths.technician.available, label: 'Solicitudes disponibles', primary: true },
  { to: workflowPaths.technician.assigned, label: 'Servicios asignados', primary: true },
  { to: workflowPaths.technician.history, label: 'Historial de servicios', primary: true },
  { to: workflowPaths.technician.earnings, label: 'Ganancias', primary: true },
  { to: workflowPaths.technician.wallet, label: 'Mi saldo' },
  { to: workflowPaths.technician.productivity, label: 'Productividad' },
  { to: workflowPaths.technician.referrals, label: 'Invita conocidos' },
  { to: workflowPaths.technician.pqr, label: 'PQR' },
  { to: workflowPaths.technician.profile, label: 'Mi perfil' },
  { to: workflowPaths.technician.legal, label: 'Compromiso y términos' },
]

export function TechnicianWorkspace() {
  return <RoleWorkspace subtitle="Panel técnico" links={links} />
}
