import { Link } from 'react-router-dom'
import { workflowPaths } from '../../../routes/paths'

const items = [
  {
    to: workflowPaths.admin.verificationIdentities,
    title: 'Identidades',
    description: 'Revisar documentos, foto de perfil y estado de verificación de usuarios.',
  },
  {
    to: workflowPaths.admin.verificationSelfies,
    title: 'Cambios de selfie',
    description: 'Aprobar o rechazar solicitudes de cambio de foto de perfil.',
  },
  {
    to: workflowPaths.admin.verificationTechnicians,
    title: 'Técnicos',
    description: 'Aprobar perfiles técnicos después de identidad y documentos.',
  },
  {
    to: workflowPaths.admin.verificationDataExports,
    title: 'Exportación de datos',
    description: 'Aprobar solicitudes y enviar el archivo al correo del usuario.',
  },
  {
    to: workflowPaths.admin.verificationVerifiers,
    title: 'Verificadores',
    description: 'Crear y consultar cuentas de verificador.',
  },
]

export function AdminVerificationHomePage() {
  return <section>
    <h2 className="text-2xl font-bold">Verificaciones</h2>
    <p className="mt-1 text-sm text-slate-400">Selecciona el flujo que quieres revisar.</p>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {items.map((item) => <Link key={item.to} to={item.to} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-colors hover:border-brand-500">
        <h3 className="text-lg font-bold text-white">{item.title}</h3>
        <p className="mt-2 text-sm text-slate-400">{item.description}</p>
      </Link>)}
    </div>
  </section>
}
