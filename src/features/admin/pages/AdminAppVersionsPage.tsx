import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { AppVersion } from '../../../types'
import { QueryState } from '../../shared/components/QueryState'
import { adminApi } from '../api'

function VersionEditor({ initial, onSave, loading }: { initial: AppVersion; onSave: (value: AppVersion) => void; loading: boolean }) {
  const [value, setValue] = useState(initial)
  return <article className="grid gap-3 rounded-xl bg-slate-900 p-5"><h3 className="text-xl font-bold">{value.platform}</h3>
    <p className="text-sm text-amber-300">No actives una actualización obligatoria hasta que la URL esté publicada y accesible.</p>
    <label>Versión mínima<input value={value.minimumSupportedVersion} onChange={(e) => setValue({ ...value, minimumSupportedVersion: e.target.value })} pattern="\d+\.\d+\.\d+" /></label>
    <label>Última versión<input value={value.latestVersion} onChange={(e) => setValue({ ...value, latestVersion: e.target.value })} pattern="\d+\.\d+\.\d+" /></label>
    <label>URL de actualización<input value={value.updateUrl} onChange={(e) => setValue({ ...value, updateUrl: e.target.value })} /></label>
    <label>Mensaje<textarea value={value.message} onChange={(e) => setValue({ ...value, message: e.target.value })} /></label>
    <label><input type="checkbox" checked={value.forceUpdate} onChange={(e) => setValue({ ...value, forceUpdate: e.target.checked })} /> Forzar actualización</label>
    <label><input type="checkbox" checked={value.active} onChange={(e) => setValue({ ...value, active: e.target.checked })} /> Control de versión activo</label>
    {!value.active && <p className="text-sm text-emerald-300">La aplicación podrá entrar sin solicitar actualización.</p>}
    <button disabled={loading || !/^\d+\.\d+\.\d+$/.test(value.minimumSupportedVersion) || !/^\d+\.\d+\.\d+$/.test(value.latestVersion) || (value.forceUpdate && !value.updateUrl)} onClick={() => onSave(value)} className="rounded-lg bg-brand-500 p-2 font-bold text-slate-950 disabled:opacity-50">Guardar</button>
  </article>
}

export function AdminAppVersionsPage() {
  const client = useQueryClient()
  const versions = useQuery({ queryKey: ['admin', 'app-versions'], queryFn: adminApi.appVersions })
  const update = useMutation({ mutationFn: adminApi.updateAppVersion, onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'app-versions'] }) })
  return <section><h2 className="mb-4 text-2xl font-bold">Versiones de App</h2><QueryState pending={versions.isPending} error={versions.error}><div className="grid gap-4 lg:grid-cols-2">{versions.data?.map((item) => <VersionEditor key={`${item.platform}-${item.updatedAt}`} initial={item} onSave={(value) => update.mutate(value)} loading={update.isPending} />)}</div></QueryState></section>
}
