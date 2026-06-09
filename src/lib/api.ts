import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
})

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('tecngo.session')
  if (raw) config.headers.Authorization = `Bearer ${JSON.parse(raw).token}`
  return config
})
