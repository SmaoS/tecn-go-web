import { useAuth } from '../../../context/useAuth'
import { serviceSupportApi } from '../../service-support/api'
import { useAllEvidences, useChatModerationQueue, useModerationQueue, useOperationsAction, usePendingProofs, useReports } from '../../service-support/hooks'
import { api } from '../../../lib/api'

const contentKindLabels: Record<string, string> = {
  PROFILE: 'Foto de perfil',
  DOCUMENT: 'Documento',
  CERTIFICATE: 'Certificado',
  SERVICE_REQUEST_IMAGE: 'Imagen de solicitud',
  SERVICE_EVIDENCE: 'Evidencia del servicio',
  PAYMENT_PROOF: 'Comprobante de pago',
}

const moderationStatusLabels: Record<string, string> = {
  PENDING_REVIEW: 'Pendiente de revisión',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  FLAGGED: 'Marcado para revisión',
}

export function AdminOperationsPage() {
  const { session } = useAuth()
  const proofs = usePendingProofs()
  const reports = useReports()
  const evidences = useAllEvidences()
  const moderation = useModerationQueue()
  const chatModeration = useChatModerationQueue()
  const action = useOperationsAction()
  return <section><h2 className="text-2xl font-bold">Operaciones y moderación</h2>
    <h3 className="mb-3 mt-6 text-lg font-bold">Mensajes reportados o bloqueados</h3>
    <div className="space-y-3">{chatModeration.data?.map((item) =>
      <article key={item.id} className="rounded-xl border border-slate-800 p-4">
        <strong>{item.senderName} · solicitud {item.serviceRequestId.slice(0, 8)}</strong>
        <p className="mt-2 whitespace-pre-wrap text-sm">{item.message}</p>
        <p className="mt-2 text-xs text-slate-400">{item.moderationStatus} · reportes abiertos: {item.openReports}</p>
        {item.moderationReason && <p className="text-xs text-amber-300">{item.moderationReason}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => action.mutate(() => serviceSupportApi.moderateChat(item.id, 'approve', 'Aprobado por revisión manual'))} className="rounded bg-emerald-500 px-3 py-2 text-slate-950">Aprobar mensaje</button>
          <button onClick={() => {
            const reason = window.prompt('Motivo del bloqueo')
            if (reason) action.mutate(() => serviceSupportApi.moderateChat(item.id, 'block', reason))
          }} className="rounded border border-red-500 px-3 py-2 text-red-300">Bloquear mensaje</button>
          {session?.role === 'ADMIN' && <button onClick={() => {
            const reason = window.prompt('Motivo de la sanción al usuario')
            if (reason) action.mutate(() => serviceSupportApi.moderateChat(item.id, 'sanction', reason))
          }} className="rounded bg-red-600 px-3 py-2 font-bold text-white">Sancionar usuario</button>}
        </div>
      </article>)}</div>
    <h3 className="mb-3 mt-6 text-lg font-bold">Contenido reportado o pendiente</h3>
    <div className="space-y-3">{moderation.data?.filter((item) =>
      item.moderationStatus !== 'APPROVED' || item.openReports > 0).map((item) =>
      <article key={item.id} className="rounded-xl border border-slate-800 p-4">
        <button onClick={async () => {
          const blob = await api.get(item.fileUrl, { responseType: 'blob' }).then(({ data }) => data)
          window.open(URL.createObjectURL(blob), '_blank', 'noopener,noreferrer')
        }} className="font-bold text-brand-300">{contentKindLabels[item.kind] ?? item.kind} · {item.uploadedByName}</button>
        <p className="text-sm text-slate-400">{moderationStatusLabels[item.moderationStatus] ?? item.moderationStatus} · reportes abiertos: {item.openReports}</p>
        {item.moderationReason && <p className="text-sm text-slate-500">{item.moderationReason}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => action.mutate(() => serviceSupportApi.moderate(item.id, true, 'Aprobado por revisión manual'))} className="rounded bg-emerald-500 px-3 py-2 text-slate-950">Aprobar</button>
          <button onClick={() => {
            const reason = window.prompt('Motivo del rechazo')
            if (reason) action.mutate(() => serviceSupportApi.moderate(item.id, false, reason))
          }} className="rounded border border-red-500 px-3 py-2 text-red-300">Rechazar</button>
          {session?.role === 'ADMIN' && <button onClick={() => {
            const comment = window.prompt('Motivo para inactivar al usuario')
            if (comment) action.mutate(() => serviceSupportApi.inactivateUser(item.uploadedByUserId, comment))
          }} className="rounded border border-red-500 px-3 py-2 text-red-300">Inactivar usuario</button>}
        </div>
      </article>)}</div>
    <h3 className="mb-3 mt-6 text-lg font-bold">Evidencias recientes</h3>
    <div className="space-y-2">{evidences.data?.slice(0, 20).map((item) => <button key={item.id} onClick={async () => {
      const blob = await api.get(item.fileUrl, { responseType: 'blob' }).then(({ data }) => data)
      window.open(URL.createObjectURL(blob), '_blank', 'noopener,noreferrer')
    }} className="block text-left text-sm text-brand-300">{item.evidenceType} · {item.uploadedByName} · solicitud {item.serviceRequestId.slice(0, 8)}</button>)}</div>
    <h3 className="mb-3 mt-6 text-lg font-bold">Comprobantes pendientes</h3>
    <div className="space-y-3">{proofs.data?.map((item) => <article key={item.id} className="rounded-xl border border-slate-800 p-4">
      <button onClick={async () => {
        const blob = await api.get(item.fileUrl, { responseType: 'blob' }).then(({ data }) => data)
        window.open(URL.createObjectURL(blob), '_blank', 'noopener,noreferrer')
      }} className="font-bold text-brand-300">${item.amount.toLocaleString()} · {item.uploadedByName}</button>
      <div className="mt-3 flex gap-2"><button onClick={() => action.mutate(() => serviceSupportApi.reviewProof(item.id, true))} className="rounded bg-emerald-500 px-3 py-2 text-slate-950">Aprobar</button><button onClick={() => {
        const comment = window.prompt('Motivo obligatorio del rechazo')
        if (comment) action.mutate(() => serviceSupportApi.reviewProof(item.id, false, comment))
      }} className="rounded border border-red-500 px-3 py-2 text-red-300">Rechazar</button></div>
    </article>)}</div>
    <h3 className="mb-3 mt-8 text-lg font-bold">Denuncias</h3>
    <div className="space-y-3">{reports.data?.map((item) => <article key={item.id} className="rounded-xl border border-slate-800 p-4">
      <strong>{item.reportedName} · {item.reason} · {item.severity}</strong><p className="mt-2 text-sm text-slate-400">{item.description}</p><p className="text-xs text-brand-300">{item.status}</p>
      {item.status === 'OPEN' && <button onClick={() => action.mutate(() => serviceSupportApi.reviewReport(item.id, 'UNDER_REVIEW', 'Caso tomado para revisión'))} className="mt-3 rounded border border-brand-500 px-3 py-2 text-sm">Tomar caso</button>}
      {session?.role === 'ADMIN' && <button onClick={() => {
        const comment = window.prompt('Motivo de inactivación')
        if (comment) action.mutate(() => serviceSupportApi.inactivateUser(item.reportedUserId, comment))
      }} className="ml-2 mt-3 rounded border border-red-500 px-3 py-2 text-sm text-red-300">Inactivar usuario denunciado</button>}
    </article>)}</div>
  </section>
}
