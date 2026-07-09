import { IdentityVerificationQueue } from '../components'

export function VerifierIdentitiesPage() {
  return <section>
    <h2 className="mb-4 text-2xl font-bold">Identidades pendientes</h2>
    <IdentityVerificationQueue />
  </section>
}
