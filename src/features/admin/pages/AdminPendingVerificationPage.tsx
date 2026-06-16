import { VerificationQueue } from '../../verification/components'

export function AdminPendingVerificationPage() {
  return <section>
    <h2 className="mb-4 text-2xl font-bold">Pendientes por Verificación</h2>
    <VerificationQueue />
  </section>
}
