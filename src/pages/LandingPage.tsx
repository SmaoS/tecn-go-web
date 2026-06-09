import { Link } from 'react-router-dom'

const services = ['Electricidad', 'Plomería', 'Computadores', 'Aires acondicionados', 'Internet', 'Celulares']

export function LandingPage() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-sm text-brand-400">Ayuda técnica, donde la necesitas</span>
          <h1 className="mt-6 text-5xl font-black leading-tight md:text-7xl">Tu hogar funciona. <span className="text-brand-400">Sin vueltas.</span></h1>
          <p className="mt-6 max-w-xl text-lg text-slate-400">Solicita técnicos de confianza a domicilio, sigue el servicio y califica la experiencia desde un solo lugar.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/registro/cliente" className="rounded-xl bg-brand-500 px-6 py-3 font-bold text-slate-950">Solicitar un técnico</Link>
            <Link to="/registro/tecnico" className="rounded-xl border border-slate-700 px-6 py-3 font-bold">Quiero ofrecer servicios</Link>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-cyan-950/30">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-400">Servicios disponibles</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {services.map((service) => <div key={service} className="rounded-2xl bg-slate-800 p-4 font-semibold">{service}</div>)}
          </div>
        </div>
      </section>
      <section className="border-y border-slate-800 bg-slate-900/50 px-6 py-16 text-center">
        <h2 className="text-3xl font-bold">Describe el problema. Encuentra ayuda. Resuélvelo.</h2>
        <p className="mt-3 text-slate-400">Un flujo simple para clientes y mejores oportunidades para técnicos locales.</p>
      </section>
    </>
  )
}
