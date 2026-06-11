import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { queryKeys } from './queryClient'

describe('caché remoto', () => {
  it('reutiliza datos frescos para la misma query key', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: false } } })
    const queryFn = vi.fn().mockResolvedValue([{ id: '1' }])
    await client.fetchQuery({ queryKey: queryKeys.clientRequests, queryFn })
    await client.fetchQuery({ queryKey: queryKeys.clientRequests, queryFn })
    expect(queryFn).toHaveBeenCalledTimes(1)
  })

  it('marca como inválidas las consultas de un flujo', async () => {
    const client = new QueryClient()
    client.setQueryData(queryKeys.adminCategories, [{ id: '1' }])
    await client.invalidateQueries({ queryKey: queryKeys.adminCategories })
    expect(client.getQueryState(queryKeys.adminCategories)?.isInvalidated).toBe(true)
  })
})
