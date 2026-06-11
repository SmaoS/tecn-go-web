import type { ReactNode } from 'react'

export function DashboardShell({ title, subtitle, children }: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return <section className="mx-auto max-w-6xl px-6 py-12">
    <p className="text-brand-400">{subtitle}</p>
    <h1 className="mt-1 text-4xl font-black">{title}</h1>
    <div className="mt-8">{children}</div>
  </section>
}
