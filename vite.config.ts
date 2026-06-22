/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

const defaultApiUrl = 'https://tecn-go-backend-production.up.railway.app/api'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = process.env.VITE_API_URL || env.VITE_API_URL || defaultApiUrl
  const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN || env.SENTRY_AUTH_TOKEN

  if (mode === 'production' && !/^https?:\/\//.test(apiUrl)) {
    throw new Error('VITE_API_URL must be an absolute backend URL in production')
  }

  return {
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        include: [
          'src/components/PasswordField.tsx',
          'src/components/ProtectedRoute.tsx',
          'src/components/privateAsset.ts',
          'src/context/AuthContext.tsx',
          'src/context/sessionStorage.ts',
          'src/features/notifications/labels.ts',
          'src/features/service-requests/status.ts',
          'src/features/shared/components/RoleWorkspace.tsx',
          'src/routes/paths.ts',
        ],
        thresholds: {
          lines: 80,
          functions: 80,
          statements: 80,
          branches: 70,
        },
      },
    },
    build: {
      sourcemap: sentryAuthToken ? 'hidden' : false,
    },
    plugins: [
      react(),
      ...(sentryAuthToken ? [sentryVitePlugin({
        authToken: sentryAuthToken,
        org: process.env.SENTRY_ORG || env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT || env.SENTRY_PROJECT,
        release: { name: process.env.VITE_APP_RELEASE || env.VITE_APP_RELEASE },
        sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
      })] : []),
    ],
  }
})
