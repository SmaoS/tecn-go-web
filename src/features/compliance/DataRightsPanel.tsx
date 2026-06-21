import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { apiMessage } from '../shared/api'
import { complianceApi } from './api'

export function DataRightsPanel() {
  const [notice, setNotice] = useState('')
  const exportData = useMutation({
    mutationFn: complianceApi.exportMine,
    onSuccess: (result) => {
      const url = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], {
        type: 'application/json',
      }))
      const link = document.createElement('a')
      link.href = url
      link.download = `tecngo-datos-${result.generatedAt.slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
      setNotice('Copia de datos generada.')
    },
    onError: (error) => setNotice(apiMessage(error)),
  })
  const anonymize = useMutation({
    mutationFn: complianceApi.requestAnonymization,
    onSuccess: () => setNotice('Solicitud de anonimización enviada para revisión.'),
    onError: (error) => setNotice(apiMessage(error)),
  })

  return <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
    <h2 className="font-bold">Privacidad y datos</h2>
    <p className="mt-1 text-sm text-slate-400">
      Descarga una copia de tus datos o solicita la anonimización de tu cuenta.
    </p>
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" disabled={exportData.isPending} onClick={() => exportData.mutate()}
        className="rounded-lg border border-brand-500 px-3 py-2 text-sm text-brand-300 disabled:opacity-50">
        {exportData.isPending ? 'Generando...' : 'Exportar mis datos'}
      </button>
      <button type="button" disabled={anonymize.isPending} onClick={() => {
        const reason = window.prompt('Motivo de la solicitud de anonimización')
        if (reason?.trim() && window.confirm('La cuenta se cerrará cuando la solicitud sea aprobada. ¿Continuar?')) {
          anonymize.mutate(reason.trim())
        }
      }} className="rounded-lg border border-red-500 px-3 py-2 text-sm text-red-300 disabled:opacity-50">
        Solicitar anonimización
      </button>
    </div>
    {notice && <p className="mt-3 text-sm text-slate-300">{notice}</p>}
  </section>
}
