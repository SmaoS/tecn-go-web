import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { legalApi } from './api'
import { apiMessage } from '../shared/api'

export function LegalDocumentsContent({
  onAccepted,
  buttonLabel = 'Aceptar todos los términos y condiciones',
  showAcceptButton = true,
}: {
  onAccepted?: () => void
  buttonLabel?: string
  showAcceptButton?: boolean
}) {
  const queryClient = useQueryClient()
  const documents = useQuery({ queryKey: ['legal', 'active'], queryFn: legalApi.active })
  const acceptAll = useMutation({
    mutationFn: legalApi.acceptAll,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['legal'] }),
        queryClient.invalidateQueries({ queryKey: ['onboarding-status'] }),
      ])
      onAccepted?.()
    },
  })
  const pendingDocuments = documents.data?.filter((document) => !document.accepted) ?? []

  if (documents.isPending) return <p className="text-slate-400">Cargando documentos legales...</p>
  if (documents.error) return <p className="text-red-400">{apiMessage(documents.error)}</p>

  return <div className="space-y-4">
    {documents.data?.map((document) => <article key={document.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-wrap justify-between gap-4">
        <strong>{document.title}</strong>
        <span className="text-xs text-slate-500">v{document.version}</span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{document.content}</p>
    </article>)}
    {showAcceptButton && <>
      {acceptAll.error && <p className="text-sm text-red-400">{apiMessage(acceptAll.error)}</p>}
      <button
        disabled={acceptAll.isPending || pendingDocuments.length === 0}
        onClick={() => acceptAll.mutate()}
        className="w-full rounded-xl bg-brand-500 px-5 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pendingDocuments.length === 0
          ? 'Términos y condiciones aceptados'
          : acceptAll.isPending ? 'Aceptando...' : buttonLabel}
      </button>
    </>}
  </div>
}
