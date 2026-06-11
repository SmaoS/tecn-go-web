import { NotificationCenter } from '../notifications/NotificationCenter'
import { DashboardShell } from '../shared/components/DashboardShell'
import { VerificationQueue } from './components'

export function VerifierDashboard() {
  return <DashboardShell title="Verificación de identidad" subtitle="Panel verificador">
    <NotificationCenter />
    <VerificationQueue />
  </DashboardShell>
}
