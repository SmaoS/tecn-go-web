import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'

export function VerifyEmailPage() {
  const [params] = useSearchParams()
  const [message, setMessage] = useState('Verificando correo...')

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      setMessage('El enlace no contiene un token válido.')
      return
    }
    api.post('/v1/auth/verify-email', { token })
      .then(() => setMessage('Correo verificado correctamente. Ya puedes continuar.'))
      .catch(() => setMessage('El enlace venció, ya fue usado o no es válido.'))
  }, [params])

  return <section className="mx-auto max-w-xl px-6 py-20 text-center"><h1 className="text-3xl font-black">Verificación de correo</h1><p className="mt-4 text-slate-300">{message}</p><Link to="/app" className="mt-8 inline-block rounded-lg bg-brand-500 px-5 py-3 font-bold text-slate-950">Ir a TecnGo</Link></section>
}
