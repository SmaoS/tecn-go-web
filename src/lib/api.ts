import axios from 'axios'

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

if (!configuredApiUrl && import.meta.env.PROD) {
  throw new Error('VITE_API_URL is required in production')
}

export const api = axios.create({
  baseURL: configuredApiUrl ?? '/api',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('tecngo.session')
  if (raw) config.headers.Authorization = `Bearer ${JSON.parse(raw).token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tecngo.session')
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)

export function assetUrl(url?: string) {
  if (!url) return undefined
  if (/^https?:\/\//.test(url)) return url
  return `${api.defaults.baseURL}${url}`
}
