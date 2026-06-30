import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, renderHook, type RenderHookOptions, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PropsWithChildren, ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext, type AuthValue } from '../context/auth-context'
import type { Session } from '../types'

interface ProviderOptions {
  route?: string
  session?: Session | null
  auth?: Partial<AuthValue>
  queryClient?: QueryClient
}

type AppRenderOptions = Omit<RenderOptions, 'wrapper'> & ProviderOptions

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
      mutations: { retry: false },
    },
  })
}

function createAuthValue(session: Session | null, auth?: Partial<AuthValue>): AuthValue {
  return {
    session,
    setSession: () => undefined,
    switchMode: async () => null,
    logout: async () => undefined,
    ...auth,
  }
}

export function createTestWrapper({
  route = '/',
  session = null,
  auth,
  queryClient = createTestQueryClient(),
}: ProviderOptions = {}) {
  return function TestProviders({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <AuthContext.Provider value={createAuthValue(session, auth)}>
          {children}
        </AuthContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>
  }
}

export function renderWithProviders(ui: ReactElement, options: AppRenderOptions = {}) {
  const {
    route,
    session,
    auth,
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = options
  return {
    user: userEvent.setup(),
    queryClient,
    ...render(ui, {
      wrapper: createTestWrapper({ route, session, auth, queryClient }),
      ...renderOptions,
    }),
  }
}

export function renderHookWithProviders<Result, Props>(
  callback: (props: Props) => Result,
  options: Omit<RenderHookOptions<Props>, 'wrapper'> & ProviderOptions = {},
) {
  const {
    route,
    session,
    auth,
    queryClient = createTestQueryClient(),
    ...hookOptions
  } = options
  return {
    queryClient,
    ...renderHook(callback, {
      wrapper: createTestWrapper({ route, session, auth, queryClient }),
      ...hookOptions,
    }),
  }
}
