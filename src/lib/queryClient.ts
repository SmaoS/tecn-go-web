import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
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
  requestQuotes: (requestIds: string[]) => ['service-quotes', requestIds] as const,
  technicianRequests: ['service-requests', 'technician'] as const,
  availableRequests: (radiusKm: string) => ['service-requests', 'available', radiusKm] as const,
  availableRequestsRoot: ['service-requests', 'available'] as const,
  payments: ['payments', 'client'] as const,
  earnings: ['payments', 'technician'] as const,
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
  adminPendingTechnicians: ['admin', 'technicians', 'pending'] as const,
  adminVerifiers: ['admin', 'verifiers'] as const,
  verifications: ['verifications', 'pending'] as const,
}
