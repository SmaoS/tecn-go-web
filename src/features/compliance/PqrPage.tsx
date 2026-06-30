import { DataRightsPanel } from './DataRightsPanel'

export function PqrPage() {
  return <section className="max-w-3xl">
    <h2 className="mb-2 text-2xl font-bold">PQR</h2>
    <p className="mb-4 text-sm text-slate-400">
      Gestiona solicitudes relacionadas con tus datos personales, anonimización y cambio de selfie.
    </p>
    <DataRightsPanel />
  </section>
}
