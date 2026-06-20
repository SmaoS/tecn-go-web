import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query'

focusManager.setEventListener((handleFocus) => {
  const onVisibilityChange = () => handleFocus(document.visibilityState === 'visible')
  document.addEventListener('visibilitychange', onVisibilityChange, false)
  window.addEventListener('focus', onVisibilityChange, false)
  return () => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('focus', onVisibilityChange)
  }
})

onlineManager.setEventListener((setOnline) => {
  const online = () => setOnline(true)
  const offline = () => setOnline(false)
  window.addEventListener('online', online)
  window.addEventListener('offline', offline)
  return () => {
    window.removeEventListener('online', online)
    window.removeEventListener('offline', offline)
  }
})

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchIntervalInBackground: false,
      retry: 1,
      staleTime: 5_000,
    },
    mutations: {
      retry: false,
    },
  },
})

export const queryKeys = {
  categories: ['categories'] as const,
  clientRequests: ['service-requests', 'client'] as const,
  clientRequestHistory: ['service-requests', 'client', 'history'] as const,
  requestQuotes: (requestIds: string[]) => ['service-quotes', requestIds] as const,
  technicianRequests: ['service-requests', 'technician'] as const,
  technicianRequestHistory: ['service-requests', 'technician', 'history'] as const,
  availableRequests: (search: object = {}) => ['service-requests', 'available', search] as const,
  availableRequestsRoot: ['service-requests', 'available'] as const,
  payments: ['payments', 'client'] as const,
  earnings: ['payments', 'technician'] as const,
  technicianWallet: ['technicians', 'me', 'wallet'] as const,
  technicianWalletTransactions: ['technicians', 'me', 'wallet', 'transactions'] as const,
  notifications: ['notifications'] as const,
  unreadNotifications: ['notifications', 'unread-count'] as const,
  profile: ['users', 'me', 'profile'] as const,
  technicianProfile: ['technicians', 'me'] as const,
  admin: ['admin'] as const,
  adminSummary: ['admin', 'summary'] as const,
  adminCategories: ['admin', 'categories'] as const,
  adminFinances: ['admin', 'finances'] as const,
  adminParameters: ['admin', 'parameters'] as const,
  adminLocations: ['admin', 'technician-locations'] as const,
  adminTechnicianWallets: ['admin', 'technician-wallets'] as const,
  adminPendingTechnicians: ['admin', 'technicians', 'pending'] as const,
  adminVerifiers: ['admin', 'verifiers'] as const,
  verifications: ['verifications', 'pending'] as const,
}
