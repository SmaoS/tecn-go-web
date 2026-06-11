import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/queryClient'
import { profileApi } from './api'

export const useProfile = () => useQuery({ queryKey: queryKeys.profile, queryFn: profileApi.me })

export function useSaveProfile() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: profileApi.save,
    onSuccess: (profile) => client.setQueryData(queryKeys.profile, profile),
  })
}
