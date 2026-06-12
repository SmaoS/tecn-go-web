import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ProtectedRoute, RoleRoute, RoleRouter } from '../components/ProtectedRoute'
import { AdminWorkspace } from '../features/admin/AdminWorkspace'
import { AdminCategoriesPage } from '../features/admin/pages/AdminCategoriesPage'
import { AdminFinancesPage } from '../features/admin/pages/AdminFinancesPage'
import { AdminOverviewPage } from '../features/admin/pages/AdminOverviewPage'
import { AdminSettingsPage } from '../features/admin/pages/AdminSettingsPage'
import { AdminVerificationPage } from '../features/admin/pages/AdminVerificationPage'
import { AdminOperationsPage } from '../features/admin/pages/AdminOperationsPage'
import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage'
import { AdminLegalPage } from '../features/admin/pages/AdminLegalPage'
import { LegalPage } from '../features/legal/LegalPage'
import { ClientWorkspace } from '../features/client/ClientWorkspace'
import { ClientPaymentsPage } from '../features/client/pages/ClientPaymentsPage'
import { ClientProfilePage } from '../features/client/pages/ClientProfilePage'
import { ClientRequestsPage } from '../features/client/pages/ClientRequestsPage'
import { CreateRequestPage } from '../features/client/pages/CreateRequestPage'
import { TechnicianWorkspace } from '../features/technician/TechnicianWorkspace'
import { AssignedServicesPage } from '../features/technician/pages/AssignedServicesPage'
import { AvailableRequestsPage } from '../features/technician/pages/AvailableRequestsPage'
import { TechnicianEarningsPage } from '../features/technician/pages/TechnicianEarningsPage'
import { TechnicianProfilePage } from '../features/technician/pages/TechnicianProfilePage'
import { TechnicianReferralsPage } from '../features/technician/pages/TechnicianReferralsPage'
import { AdminReferralsPage } from '../features/admin/pages/AdminReferralsPage'
import { AdminAppVersionsPage } from '../features/admin/pages/AdminAppVersionsPage'
import { VerifierDashboard } from '../features/verification/VerifierDashboard'
import { LoginPage, RegisterPage } from '../pages/AuthPages'
import { HealthPage } from '../pages/HealthPage'
import { LandingPage } from '../pages/LandingPage'
import { VerifyEmailPage } from '../pages/VerifyEmailPage'

export function AppRoutes() {
  return <Routes>
    <Route element={<Layout />}>
      <Route index element={<LandingPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="registro/:kind" element={<RegisterPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="health" element={<HealthPage />} />
      <Route path="verificar-correo" element={<VerifyEmailPage />} />
      <Route path="app" element={<ProtectedRoute />}>
        <Route index element={<RoleRouter />} />
        <Route element={<RoleRoute role="CLIENT" />}><Route path="cliente" element={<ClientWorkspace />}>
          <Route index element={<Navigate to="solicitudes" replace />} />
          <Route path="solicitudes" element={<ClientRequestsPage />} />
          <Route path="nueva" element={<CreateRequestPage />} />
          <Route path="pagos" element={<ClientPaymentsPage />} />
          <Route path="perfil" element={<ClientProfilePage />} />
          <Route path="legal" element={<LegalPage />} />
        </Route></Route>
        <Route element={<RoleRoute role="TECHNICIAN" />}><Route path="tecnico" element={<TechnicianWorkspace />}>
          <Route index element={<Navigate to="disponibles" replace />} />
          <Route path="asignadas" element={<AssignedServicesPage />} />
          <Route path="disponibles" element={<AvailableRequestsPage />} />
          <Route path="ganancias" element={<TechnicianEarningsPage />} />
          <Route path="perfil" element={<TechnicianProfilePage />} />
          <Route path="referidos" element={<TechnicianReferralsPage />} />
          <Route path="legal" element={<LegalPage />} />
        </Route></Route>
        <Route element={<RoleRoute role="VERIFIER" />}><Route path="verificador" element={<VerifierDashboard />} /></Route>
        <Route element={<RoleRoute role="ADMIN" />}><Route path="admin" element={<AdminWorkspace />}>
          <Route index element={<Navigate to="resumen" replace />} />
          <Route path="resumen" element={<AdminOverviewPage />} />
          <Route path="verificaciones" element={<AdminVerificationPage />} />
          <Route path="categorias" element={<AdminCategoriesPage />} />
          <Route path="finanzas" element={<AdminFinancesPage />} />
          <Route path="configuracion" element={<AdminSettingsPage />} />
          <Route path="operaciones" element={<AdminOperationsPage />} />
          <Route path="usuarios" element={<AdminUsersPage />} />
          <Route path="legal" element={<AdminLegalPage />} />
          <Route path="referidos" element={<AdminReferralsPage />} />
          <Route path="versiones-app" element={<AdminAppVersionsPage />} />
        </Route></Route>
      </Route>
    </Route>
  </Routes>
}
