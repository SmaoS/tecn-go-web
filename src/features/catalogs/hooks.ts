import { useQuery } from '@tanstack/react-query'
import { geographicCatalogApi } from './api'

export const useCountries = () => useQuery({
  queryKey: ['geographic-catalogs', 'countries'],
  queryFn: geographicCatalogApi.countries,
})

export const useDepartments = (countryId?: string) => useQuery({
  queryKey: ['geographic-catalogs', 'departments', countryId],
  queryFn: () => geographicCatalogApi.departments(countryId!),
  enabled: Boolean(countryId),
})

export const useCities = (departmentId?: string) => useQuery({
  queryKey: ['geographic-catalogs', 'cities', departmentId],
  queryFn: () => geographicCatalogApi.cities(departmentId!),
  enabled: Boolean(departmentId),
})
