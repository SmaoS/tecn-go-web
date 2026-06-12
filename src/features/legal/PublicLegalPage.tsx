import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { QueryState } from '../shared/components/QueryState'
import { legalApi } from './api'

const pageConfig = {
  privacy: {
    heading: 'Política de privacidad',
    description: 'Cómo TecnGo recopila, utiliza y protege la información de sus usuarios.',
    codes: ['PRIVACY_POLICY'],
  },
  terms: {
    heading: 'Términos y condiciones',
    description: 'Condiciones aplicables a clientes y técnicos que utilizan TecnGo.',
    codes: ['CLIENT_TERMS', 'TECHNICIAN_TERMS'],
  },
  dataTreatment: {
    heading: 'Tratamiento de datos personales',
    description: 'Autorización y reglas para el tratamiento de datos personales en Colombia.',
    codes: ['DATA_TREATMENT_POLICY'],
  },
  accessibility: {
    heading: 'Accesibilidad',
    description: 'Compromiso de TecnGo con una experiencia clara, legible e inclusiva.',
    codes: ['ACCESSIBILITY_POLICY'],
  },
} as const

export function PublicLegalPage({ kind }: { kind: keyof typeof pageConfig }) {
  const config = pageConfig[kind]
  const documents = useQuery({
    queryKey: ['legal', 'public'],
    queryFn: legalApi.publicActive,
    staleTime: 5 * 60_000,
  })
  const visible = documents.data?.filter((item) =>
    (config.codes as readonly string[]).includes(item.code)) ?? []

  return <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
    <Link to="/" className="text-sm font-semibold text-brand-400 hover:text-brand-300">
      Volver a TecnGo
    </Link>
    <h1 className="mt-5 text-3xl font-black md:text-5xl">{config.heading}</h1>
    <p className="mt-3 text-slate-400">{config.description}</p>
    <div className="mt-8">
      <QueryState
        pending={documents.isPending}
        error={documents.error}
        empty={!documents.isPending && visible.length === 0}
      >
        <div className="space-y-6">
          {visible.map((item) => <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">{item.title}</h2>
              <span className="text-sm text-slate-500">Versión {item.version}</span>
            </div>
            <p className="mt-6 whitespace-pre-wrap leading-7 text-slate-300">{item.content}</p>
          </article>)}
        </div>
      </QueryState>
    </div>
  </section>
}
