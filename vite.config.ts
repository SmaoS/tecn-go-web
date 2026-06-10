import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const defaultApiUrl = 'https://tecn-go-backend-production.up.railway.app/api'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = process.env.VITE_API_URL || env.VITE_API_URL || defaultApiUrl

  if (mode === 'production' && !/^https?:\/\//.test(apiUrl)) {
    throw new Error('VITE_API_URL must be an absolute backend URL in production')
  }

  return {
    plugins: [react()],
  }
})
