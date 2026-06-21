import * as Sentry from '@sentry/react'

const dsn = import.meta.env.VITE_SENTRY_DSN

export function initializeObservability() {
  Sentry.init({
    dsn,
    enabled: Boolean(dsn) && import.meta.env.PROD,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_RELEASE || 'tecngo-web@1.0.0',
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || 0.1),
    sendDefaultPii: false,
  })
}

export function setObservedUser(userId?: string, role?: string) {
  Sentry.setUser(userId ? { id: userId } : null)
  Sentry.setTag('role', role || 'anonymous')
}

export function captureClientError(error: unknown, correlationId?: string) {
  Sentry.withScope((scope) => {
    if (correlationId) scope.setTag('correlationId', correlationId)
    Sentry.captureException(error)
  })
}

export { Sentry }
