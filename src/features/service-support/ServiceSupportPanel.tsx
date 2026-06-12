import { useState } from 'react'
import { serviceSupportApi } from './api'
import { usePaymentProofs, useServiceEvidence, useServiceSupportAction } from './hooks'
import type { EvidenceType, ProofMethod } from './types'
import { api } from '../../lib/api'

async function openPrivateFile(url: string) {
  const blob = await api.get(url, { responseType: 'blob' }).then(({ data }) => data)
  window.open(URL.createObjectURL(blob), '_blank', 'noopener,noreferrer')
}

export function ServiceSupportPanel({ requestId }: { requestId: string }) {
  const [open, setOpen] = useState(false)
  const [evidenceFile, setEvidenceFile] = useState<File>()
  const [proofFile, setProofFile] = useState<File>()
  const [type, setType] = useState<EvidenceType>('BEFORE_SERVICE')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<ProofMethod>('TRANSFER')
  const evidence = useServiceEvidence(requestId, open)
  const proofs = usePaymentProofs(requestId, open)
  const action = useServiceSupportAction(requestId)
  const inputClass = 'rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm'
  const evidenceLabels: Record<EvidenceType, string> = {
    BEFORE_SERVICE: 'Antes del servicio',
    DURING_SERVICE: 'Durante el servicio',
    AFTER_SERVICE: 'Después del servicio',
    PAYMENT_PROOF: 'Comprobante de pago',
    DAMAGE_REPORT: 'Reporte de daño',
    OTHER: 'Otra evidencia',
  }

  return <div className="mt-4 border-t border-slate-800 pt-4">
    <button onClick={() => setOpen(!open)} className="text-sm font-bold text-brand-300">{open ? 'Ocultar soporte del servicio' : 'Evidencias, pagos y reportes'}</button>
    {open && <div className="mt-3 grid gap-4 lg:grid-cols-2">
      <div className="grid gap-2 rounded-xl bg-slate-950/50 p-3">
        <strong>Evidencias</strong>
        <select className={inputClass} value={type} onChange={(event) => setType(event.target.value as EvidenceType)}>
          {(Object.keys(evidenceLabels) as EvidenceType[]).map((value) => <option key={value} value={value}>{evidenceLabels[value]}</option>)}
        </select>
        <input className={inputClass} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(event) => setEvidenceFile(event.target.files?.[0])} />
        <input className={inputClass} placeholder="Descripción" value={description} onChange={(event) => setDescription(event.target.value)} />
        <button disabled={!evidenceFile || action.isPending} onClick={() => evidenceFile && action.mutate(() => serviceSupportApi.uploadEvidence(requestId, evidenceFile, type, description))} className="rounded-lg bg-brand-500 p-2 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">Subir evidencia</button>
        {evidence.data?.map((item) => <button key={item.id} onClick={() => void openPrivateFile(item.fileUrl)} className="text-left text-sm text-brand-300">{item.description || evidenceLabels[item.evidenceType]} · {item.uploadedByName}</button>)}
      </div>
      <div className="grid gap-2 rounded-xl bg-slate-950/50 p-3">
        <strong>Comprobante de pago</strong>
        <input className={inputClass} type="number" placeholder="Monto" value={amount} onChange={(event) => setAmount(event.target.value)} />
        <select className={inputClass} value={method} onChange={(event) => setMethod(event.target.value as ProofMethod)}>
          {['CASH', 'TRANSFER', 'WOMPI', 'MERCADO_PAGO', 'PAYU', 'OTHER'].map((value) => <option key={value}>{value}</option>)}
        </select>
        <input className={inputClass} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(event) => setProofFile(event.target.files?.[0])} />
        <button disabled={!proofFile || !amount || Number(amount) <= 0 || action.isPending} onClick={() => proofFile && action.mutate(() => serviceSupportApi.uploadProof(requestId, proofFile, Number(amount), method))} className="rounded-lg bg-emerald-500 p-2 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">Enviar comprobante</button>
        {proofs.data?.map((item) => <p key={item.id} className="text-sm"><button onClick={() => void openPrivateFile(item.fileUrl)} className="text-brand-300">${item.amount.toLocaleString()}</button> · {item.status}{item.reviewComment && ` · ${item.reviewComment}`}</p>)}
        <button onClick={() => {
          const description = window.prompt('Describe el problema')
          if (description) action.mutate(() => serviceSupportApi.report(requestId, 'OTHER', description))
        }} className="rounded-lg border border-red-500/50 p-2 text-sm text-red-300">Reportar problema</button>
      </div>
      {action.error && <p className="text-sm text-red-300">No fue posible completar la operación.</p>}
    </div>}
  </div>
}
