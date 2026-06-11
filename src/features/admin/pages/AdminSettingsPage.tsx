import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../../lib/queryClient'
import type { SystemParameter } from '../../../types'
import { UserProfileEditor } from '../../profile/components'
import { QueryState } from '../../shared/components/QueryState'
import { adminApi } from '../api'
import { SystemParametersPanel, TechnicianLocationsPanel } from '../components'
import { useAdminLocations, useAdminParameters } from '../hooks'

export function AdminSettingsPage() {
  const client = useQueryClient()
  const parameters = useAdminParameters()
  const locations = useAdminLocations()
  const update = useMutation({
    mutationFn: ({ parameter, value }: { parameter: SystemParameter; value: string }) =>
      adminApi.updateParameter(parameter.key, value),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.adminParameters }),
  })
  return <section><h2 className="mb-4 text-2xl font-bold">Configuración</h2><UserProfileEditor />
    <QueryState pending={parameters.isPending} error={parameters.error}>
      <SystemParametersPanel items={parameters.data ?? []} onSave={(parameter, value) => update.mutateAsync({ parameter, value })} />
    </QueryState>
    <QueryState pending={locations.isPending} error={locations.error}>
      <TechnicianLocationsPanel items={locations.data ?? []} />
    </QueryState>
  </section>
}
