import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/Layout'
import { ProtectedRoute, RoleRoute, RoleRouter } from './components/ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import { AdminDashboard, ClientDashboard, TechnicianDashboard } from './pages/Dashboards'
import { HealthPage } from './pages/HealthPage'

export default function App() {
  return <BrowserRouter><AuthProvider><Routes>
    <Route element={<Layout />}>
      <Route index element={<LandingPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="registro/:kind" element={<RegisterPage />} />
      <Route path="health" element={<HealthPage />} />
      <Route path="app" element={<ProtectedRoute />}>
        <Route index element={<RoleRouter />} />
        <Route element={<RoleRoute role="CLIENT" />}><Route path="cliente" element={<ClientDashboard />} /></Route>
        <Route element={<RoleRoute role="TECHNICIAN" />}><Route path="tecnico" element={<TechnicianDashboard />} /></Route>
        <Route element={<RoleRoute role="ADMIN" />}><Route path="admin" element={<AdminDashboard />} /></Route>
      </Route>
    </Route>
  </Routes></AuthProvider></BrowserRouter>
}
