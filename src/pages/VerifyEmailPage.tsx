import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'

type VerificationStatus = 'loading' | 'success' | 'error'

const APP_PATH = '/app'
const APP_OPEN_PATH = `/abrir-app?path=${encodeURIComponent(APP_PATH)}`

function isMobileDevice() {
  if (typeof navigator === 'undefined') {
    return false
  }
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function VerifyEmailPage() {
  const [params] = useSearchParams()
  const [message, setMessage] = useState('Verificando correo...')
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const preferApp = isMobileDevice()

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      setMessage('El enlace no contiene un token válido.')
      setStatus('error')
      return
    }
    api.post('/v1/auth/verify-email', { token })
      .then(() => {
        setMessage('Correo verificado correctamente. Ya puedes continuar.')
        setStatus('success')
      })
      .catch(() => {
        setMessage('El enlace venció, ya fue usado o no es válido.')
        setStatus('error')
      })
  }, [params])

  const appButton = <a href={APP_OPEN_PATH} className="inline-flex justify-center rounded-lg bg-brand-500 px-5 py-3 font-bold text-slate-950">Continuar en la app</a>
  const webButton = <Link to={APP_PATH} className="inline-flex justify-center rounded-lg border border-slate-600 px-5 py-3 font-bold text-white hover:border-brand-500">Continuar en la web</Link>

  return (
    <section className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="text-3xl font-black">Verificación de correo</h1>
      <p className="mt-4 text-slate-300">{message}</p>
      {status === 'success' ? (
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {preferApp ? appButton : webButton}
          {preferApp ? webButton : appButton}
        </div>
      ) : (
        <Link to={APP_PATH} className="mt-8 inline-block rounded-lg bg-brand-500 px-5 py-3 font-bold text-slate-950">Ir a TecnGo</Link>
      )}
    </section>
  )
}
