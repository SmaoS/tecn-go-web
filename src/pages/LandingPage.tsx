import { Link } from 'react-router-dom'

const services = ['Electricidad', 'Plomería', 'Computadores', 'Aires acondicionados', 'Internet', 'Celulares']

export function LandingPage() {
  return (
    <>
      <section className="mx-auto grid min-h-[76vh] max-w-7xl gap-14 px-6 py-16 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/35 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-300"><span className="h-2 w-2 rounded-full bg-brand-500" />Un técnico cerca de ti</span>
          <h1 className="mt-7 max-w-3xl text-5xl font-extrabold leading-[1.04] tracking-tight md:text-7xl">Soluciones técnicas, <span className="text-brand-400">justo donde las necesitas.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">Conecta con técnicos verificados, compara cotizaciones y sigue cada servicio desde un solo lugar.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/registro/cliente" className="tecngo-primary">Solicitar un técnico</Link>
            <Link to="/registro/tecnico" className="rounded-xl border border-slate-700 px-6 py-3 font-bold hover:border-brand-500/60 hover:text-brand-300">Quiero ofrecer servicios</Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400"><span>✓ Técnicos verificados</span><span>✓ Cotizaciones claras</span><span>✓ Seguimiento del servicio</span></div>
        </div>
        <div className="tecngo-panel relative overflow-hidden p-7 sm:p-9">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-500/10 blur-3xl" />
          <img src="/tecngo-isotipo.png" alt="" className="mb-7 h-20 w-auto" />
          <p className="text-sm font-bold uppercase tracking-[.18em] text-brand-400">Servicios disponibles</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {services.map((service) => <div key={service} className="rounded-2xl border border-slate-800 bg-canvas/60 p-4 font-semibold text-slate-200">{service}</div>)}
          </div>
        </div>
      </section>
      <section className="border-y border-slate-800 bg-surface/50 px-6 py-16 text-center">
        <h2 className="text-3xl font-bold">Describe el problema. Encuentra ayuda. Resuélvelo.</h2>
        <p className="mt-3 text-slate-400">Un flujo simple para clientes y mejores oportunidades para técnicos locales.</p>
      </section>
    </>
  )
}
