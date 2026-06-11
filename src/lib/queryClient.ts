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
  technicianRequests: ['service-requests', 'technician'] as const,
  availableRequests: (radiusKm: string) => ['service-requests', 'available', radiusKm] as const,
  payments: ['payments', 'client'] as const,
  earnings: ['payments', 'technician'] as const,
  notifications: ['notifications'] as const,
  unreadNotifications: ['notifications', 'unread-count'] as const,
  profile: ['users', 'me', 'profile'] as const,
  technicianProfile: ['technicians', 'me'] as const,
  admin: ['admin'] as const,
  verifications: ['verifications', 'pending'] as const,
}
