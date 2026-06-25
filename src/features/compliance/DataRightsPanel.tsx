import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { apiMessage } from '../shared/api'
import { complianceApi } from './api'
import type { DataRequestStatus } from './types'

const statusLabel: Record<DataRequestStatus, string> = {
  PENDING: 'Pendiente de revisión',
  APPROVED: 'Aprobada',
  SENT: 'Enviada al correo',
  COMPLETED: 'Completada',
  REJECTED: 'Rechazada',
}

export function DataRightsPanel() {
  const client = useQueryClient()
  const [notice, setNotice] = useState('')
  const exports = useQuery({ queryKey: ['compliance', 'exports'], queryFn: complianceApi.exportRequests })
  const exportData = useMutation({
    mutationFn: complianceApi.requestExport,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['compliance', 'exports'] })
      setNotice('Solicitud creada. Te enviaremos el archivo al correo cuando sea aprobada.')
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
      Solicita una copia de tus datos o pide la anonimización de tu cuenta.
      La exportación será revisada y enviada a tu correo registrado.
    </p>
    {exports.data?.[0] && <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm">
      <strong>Última exportación: {statusLabel[exports.data[0].status]}</strong>
      <p className="text-slate-400">Solicitada el {new Date(exports.data[0].requestedAt).toLocaleString()}</p>
      {exports.data[0].sentAt && <p className="text-emerald-300">Archivo enviado el {new Date(exports.data[0].sentAt).toLocaleString()}</p>}
      {exports.data[0].rejectionReason && <p className="text-red-300">Motivo: {exports.data[0].rejectionReason}</p>}
    </div>}
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" disabled={exportData.isPending} onClick={() => exportData.mutate()}
        className="rounded-lg border border-brand-500 px-3 py-2 text-sm text-brand-300 disabled:opacity-50">
        {exportData.isPending ? 'Enviando solicitud...' : 'Solicitar exportación de mis datos'}
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
