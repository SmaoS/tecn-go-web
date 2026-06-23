import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { LegalDocumentsContent } from './LegalDocumentsContent'

export function LegalPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo')

  return <section>
    <h2 className="mb-2 text-2xl font-bold">Seguridad, términos y tratamiento de datos</h2>
    <p className="mb-5 text-slate-300">Lee todos los documentos. Al final puedes aceptarlos en una sola acción.</p>
    <LegalDocumentsContent onAccepted={() => {
      if (returnTo?.startsWith('/app/') && returnTo !== location.pathname) navigate(returnTo, { replace: true })
    }} />
  </section>
}
