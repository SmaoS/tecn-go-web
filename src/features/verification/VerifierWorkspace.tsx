import { workflowPaths } from '../../routes/paths'
import { RoleWorkspace } from '../shared/components/RoleWorkspace'

const links = [
  { to: workflowPaths.verifier.identities, label: 'Identidades', primary: true },
  { to: workflowPaths.verifier.selfies, label: 'Cambios de selfie', primary: true },
  { to: workflowPaths.verifier.dataExports, label: 'Exportación de datos', primary: true },
  { to: workflowPaths.verifier.operations, label: 'Moderación' },
]

export function VerifierWorkspace() {
  return <RoleWorkspace title="Verificación de identidad" subtitle="Panel verificador" links={links} />
}
