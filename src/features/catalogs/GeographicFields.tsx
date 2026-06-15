import { useCities, useCountries, useDepartments } from './hooks'

export function GeographicFields({ countryId, departmentId, cityId, onChange }: {
  countryId?: string
  departmentId?: string
  cityId?: string
  onChange: (values: { countryId?: string; departmentId?: string; cityId?: string; cityName?: string }) => void
}) {
  const countries = useCountries()
  const departments = useDepartments(countryId)
  const cities = useCities(departmentId)
  return <>
    <label className="text-sm">País
      <select value={countryId ?? ''} onChange={(event) => onChange({ countryId: event.target.value || undefined, departmentId: undefined, cityId: undefined, cityName: undefined })} required>
        <option value="">Selecciona un país</option>
        {countries.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>
    <label className="text-sm">Departamento
      <select value={departmentId ?? ''} disabled={!countryId} onChange={(event) => onChange({ countryId, departmentId: event.target.value || undefined, cityId: undefined, cityName: undefined })} required>
        <option value="">Selecciona un departamento</option>
        {departments.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>
    <label className="text-sm">Ciudad
      <select value={cityId ?? ''} disabled={!departmentId} onChange={(event) => {
        const selected = cities.data?.find((item) => item.id === event.target.value)
        onChange({ countryId, departmentId, cityId: selected?.id, cityName: selected?.name })
      }} required>
        <option value="">Selecciona una ciudad</option>
        {cities.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>
  </>
}
