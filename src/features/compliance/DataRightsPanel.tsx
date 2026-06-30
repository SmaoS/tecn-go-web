import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState, type ChangeEvent } from 'react'
import { uploadFile } from '../../lib/files'
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
  const fileRef = useRef<HTMLInputElement>(null)
  const [notice, setNotice] = useState('')
  const exports = useQuery({ queryKey: ['compliance', 'exports'], queryFn: complianceApi.exportRequests })
  const selfieChanges = useQuery({
    queryKey: ['compliance', 'profile-selfie-changes'],
    queryFn: complianceApi.profileSelfieChangeRequests,
  })
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
  const selfieChange = useMutation({
    mutationFn: async (file: File) => complianceApi.requestProfileSelfieChange(await uploadFile(file, 'PROFILE')),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['compliance', 'profile-selfie-changes'] })
      setNotice('Selfie enviada para revisión. Tu foto actual seguirá activa hasta que sea aprobada.')
      if (fileRef.current) fileRef.current.value = ''
    },
    onError: (error) => setNotice(apiMessage(error)),
  })

  function requestSelfieChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (selected) selfieChange.mutate(selected)
  }
  const selfieChangePending = selfieChanges.data?.some((item) => item.status === 'PENDING') ?? false

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
    {selfieChanges.data?.[0] && <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm">
      <strong>Último cambio de selfie: {statusLabel[selfieChanges.data[0].status]}</strong>
      <p className="text-slate-400">Solicitado el {new Date(selfieChanges.data[0].requestedAt).toLocaleString()}</p>
      {selfieChanges.data[0].rejectionReason && <p className="text-red-300">Motivo: {selfieChanges.data[0].rejectionReason}</p>}
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
      <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={requestSelfieChange} />
      <button type="button" disabled={selfieChange.isPending || selfieChangePending} onClick={() => fileRef.current?.click()}
        className="rounded-lg border border-brand-500 px-3 py-2 text-sm text-brand-300 disabled:opacity-50">
        {selfieChange.isPending ? 'Enviando selfie...' : selfieChangePending ? 'Cambio de selfie pendiente' : 'Solicitar cambio de selfie'}
      </button>
    </div>
    {notice && <p className="mt-3 text-sm text-slate-300">{notice}</p>}
  </section>
}
