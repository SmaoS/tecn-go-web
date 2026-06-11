import { NotificationCenter } from '../notifications/NotificationCenter'
import { DashboardShell } from '../shared/components/DashboardShell'
import { VerificationQueue } from './components'
import { AdminOperationsPage } from '../admin/pages/AdminOperationsPage'

export function VerifierDashboard() {
  return <DashboardShell title="Verificación de identidad" subtitle="Panel verificador">
    <NotificationCenter />
    <VerificationQueue />
    <div className="mt-10"><AdminOperationsPage /></div>
  </DashboardShell>
}
