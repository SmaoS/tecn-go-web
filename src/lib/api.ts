import axios from 'axios'

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
  const raw = localStorage.getItem('tecngo.session')
  if (raw) config.headers.Authorization = `Bearer ${JSON.parse(raw).token}`
  if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
    pendingMutations += 1
    notifyLoading()
    config.headers['X-TecnGo-Loading'] = 'true'
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    if (response.config.headers['X-TecnGo-Loading']) {
      pendingMutations = Math.max(0, pendingMutations - 1)
      notifyLoading()
    }
    return response
  },
  (error) => {
    if (error.config?.headers?.['X-TecnGo-Loading']) {
      pendingMutations = Math.max(0, pendingMutations - 1)
      notifyLoading()
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('tecngo.session')
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    if (error.response?.status === 403 && error.response.data?.code === 'EMAIL_NOT_VERIFIED'
      && window.location.pathname !== '/app/confirmar-correo') {
      window.location.assign('/app/confirmar-correo')
    }
    if (error.response?.status === 403 && error.response.data?.code === 'ONBOARDING_REQUIRED'
      && window.location.pathname !== '/app/onboarding') {
      window.location.assign('/app/onboarding')
    }
    return Promise.reject(error)
  },
)

export function assetUrl(url?: string) {
  if (!url) return undefined
  if (/^https?:\/\//.test(url)) return url
  return `${api.defaults.baseURL}${url}`
}
