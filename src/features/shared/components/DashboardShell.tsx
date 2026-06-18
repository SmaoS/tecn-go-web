import type { ReactNode } from 'react'

export function DashboardShell({ title, subtitle, children }: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
    <div className="mb-8 flex items-center gap-4">
      <img src="/tecngo-isotipo.png" alt="" className="h-12 w-auto sm:h-14" />
      <div><p className="text-sm font-bold uppercase tracking-[.14em] text-brand-400">{subtitle}</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1></div>
    </div>
    <div>{children}</div>
  </section>
}
