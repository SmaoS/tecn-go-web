import { UserProfileEditor } from '../../profile/components'
import { DataRightsPanel } from '../../compliance/DataRightsPanel'

export function ClientProfilePage() {
  return <section><h2 className="mb-4 text-2xl font-bold">Mi perfil</h2>
    <UserProfileEditor /><DataRightsPanel />
  </section>
}
