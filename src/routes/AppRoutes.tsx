import { Route, Routes } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ProtectedRoute, RoleRoute, RoleRouter } from '../components/ProtectedRoute'
import { AdminDashboard } from '../features/admin/AdminDashboard'
import { ClientDashboard } from '../features/client/ClientDashboard'
import { TechnicianDashboard } from '../features/technician/TechnicianDashboard'
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
      <Route path="health" element={<HealthPage />} />
      <Route path="verificar-correo" element={<VerifyEmailPage />} />
      <Route path="app" element={<ProtectedRoute />}>
        <Route index element={<RoleRouter />} />
        <Route element={<RoleRoute role="CLIENT" />}><Route path="cliente" element={<ClientDashboard />} /></Route>
        <Route element={<RoleRoute role="TECHNICIAN" />}><Route path="tecnico" element={<TechnicianDashboard />} /></Route>
        <Route element={<RoleRoute role="VERIFIER" />}><Route path="verificador" element={<VerifierDashboard />} /></Route>
        <Route element={<RoleRoute role="ADMIN" />}><Route path="admin" element={<AdminDashboard />} /></Route>
      </Route>
    </Route>
  </Routes>
}
