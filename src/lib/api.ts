import axios from 'axios'
import { captureClientError, Sentry } from './observability'
import { clearStoredSession, readStoredSession } from '../context/sessionStorage'
import { redirectBrowser } from './browserNavigation'

const defaultApiUrl = 'https://tecn-go-backend-production.up.railway.app/api'
const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || defaultApiUrl

if (import.meta.env.PROD && !/^https?:\/\//.test(configuredApiUrl)) {
  throw new Error('VITE_API_URL must be an absolute backend URL in production')
}

export const api = axios.create({
  baseURL: configuredApiUrl,
  timeout: 15000,
})

let pendingMutations = 0
const loadingListeners = new Set<(loading: boolean) => void>()

function notifyLoading() {
  loadingListeners.forEach((listener) => listener(pendingMutations > 0))
}

export function subscribeApiLoading(listener: (loading: boolean) => void) {
  loadingListeners.add(listener)
  listener(pendingMutations > 0)
  return () => {
    loadingListeners.delete(listener)
  }
}

api.interceptors.request.use((config) => {
  const correlationId = crypto.randomUUID()
  config.headers['X-Correlation-ID'] = correlationId
  config.headers['X-TecnGo-Correlation-ID'] = correlationId
  const session = readStoredSession()
  if (session) config.headers.Authorization = `Bearer ${session.token}`
  if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
    pendingMutations += 1
    notifyLoading()
    config.headers['X-TecnGo-Loading'] = 'true'
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    const correlationId = response.headers['x-correlation-id']
    if (correlationId) {
      Sentry.addBreadcrumb({
        category: 'api',
        message: `${response.config.method?.toUpperCase()} ${response.config.url}`,
        data: { correlationId, status: response.status },
        level: 'info',
      })
    }
    if (response.config.headers['X-TecnGo-Loading']) {
      pendingMutations = Math.max(0, pendingMutations - 1)
      notifyLoading()
    }
    return response
  },
  (error) => {
    const correlationId = error.response?.headers?.['x-correlation-id']
      || error.config?.headers?.['X-TecnGo-Correlation-ID']
    if (!error.response || error.response.status >= 500) {
      captureClientError(error, correlationId)
    }
    if (error.config?.headers?.['X-TecnGo-Loading']) {
      pendingMutations = Math.max(0, pendingMutations - 1)
      notifyLoading()
    }
    if (error.response?.status === 401) {
      clearStoredSession()
      redirectBrowser('/login')
    }
    if (error.response?.status === 403 && error.response.data?.code === 'EMAIL_NOT_VERIFIED'
    ) {
      redirectBrowser('/app/confirmar-correo')
    }
    if (error.response?.status === 403 && error.response.data?.code === 'ONBOARDING_REQUIRED'
    ) {
      redirectBrowser('/app/onboarding')
    }
    if (error.response?.status === 409 && error.response.data?.code === 'LEGAL_ACCEPTANCE_REQUIRED') {
      const session = readStoredSession()
      const role = session?.activeMode ?? session?.role
      const legalPath = role === 'TECHNICIAN' ? '/app/tecnico/legal' : '/app/cliente/legal'
      if (window.location.pathname !== legalPath) {
        const returnTo = `${window.location.pathname}${window.location.search}`
        redirectBrowser(`${legalPath}?required=1&returnTo=${encodeURIComponent(returnTo)}`)
      }
    }
    return Promise.reject(error)
  },
)

export function assetUrl(url?: string) {
  if (!url) return undefined
  if (/^https?:\/\//.test(url)) return url
  return `${api.defaults.baseURL}${url}`
}
