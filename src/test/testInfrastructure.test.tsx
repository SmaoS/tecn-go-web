import { useQuery } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useAuth } from '../context/useAuth'
import { api } from '../lib/api'
import { installGeolocationMock } from './browserMocks'
import { sessionFixture } from './fixtures'
import { renderWithProviders } from './renderWithProviders'
import { server } from './server'

function ContextProbe() {
  const { session } = useAuth()
  const location = useLocation()
  return <p>{session?.fullName} · {location.pathname}</p>
}

function ApiProbe() {
  const query = useQuery({
    queryKey: ['test', 'health'],
    queryFn: () => api.get<{ status: string }>('/v1/test-health').then(({ data }) => data),
  })
  return <p>{query.data?.status ?? 'cargando'}</p>
}

describe('infraestructura de pruebas web', () => {
  it('renderiza con sesión, router y QueryClient aislados', () => {
    const { queryClient } = renderWithProviders(<ContextProbe />, {
      route: '/app/cliente/solicitudes',
      session: sessionFixture({ fullName: 'Cliente de prueba' }),
    })

    expect(screen.getByText('Cliente de prueba · /app/cliente/solicitudes')).toBeInTheDocument()
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
  })

  it('intercepta la API con MSW sin consumir el backend real', async () => {
    server.use(http.get('*/v1/test-health', () => HttpResponse.json({ status: 'online' })))

    renderWithProviders(<ApiProbe />)

    await waitFor(() => expect(screen.getByText('online')).toBeInTheDocument())
  })

  it('permite simular la ubicación del navegador', () => {
    const { geolocation } = installGeolocationMock({ latitude: 4.15, longitude: -73.64 })
    navigator.geolocation.getCurrentPosition(() => undefined)

    expect(geolocation.getCurrentPosition).toHaveBeenCalledOnce()
  })
})
