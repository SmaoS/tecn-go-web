import { useState, type FormEvent } from 'react'
import type { ServiceRequest } from '../../types'
import { QueryState } from '../shared/components/QueryState'
import { useChat, useReportMessage, useSendMessage } from './hooks'

export function ChatPanel({ request, currentUserId, onClose }: {
  request: ServiceRequest
  currentUserId: string
  onClose: () => void
}) {
  const [text, setText] = useState('')
  const messages = useChat(request.id)
  const send = useSendMessage(request.id)
  const report = useReportMessage(request.id)
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!text.trim()) return
    send.mutate(text, { onSuccess: () => setText('') })
  }
  return <section className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4">
    <div className="w-full max-w-xl rounded-3xl border border-slate-700 bg-slate-900 p-6">
      <div className="flex justify-between"><h2 className="text-xl font-bold">Chat · {request.categoryName}</h2><button onClick={onClose}>Cerrar</button></div>
      <QueryState pending={messages.isPending} error={messages.error}><div className="my-4 max-h-80 space-y-2 overflow-y-auto">
        {(messages.data?.length ?? 0) === 0 && <p className="text-slate-500">Inicia la conversación.</p>}
        {messages.data?.map((item) => <div key={item.id} className={`max-w-[80%] rounded-xl p-3 ${item.senderId === currentUserId ? 'ml-auto bg-brand-500 text-slate-950' : 'bg-slate-800'}`}>
          <p className="text-xs font-bold">{item.senderName}</p>
          <p className={item.moderationStatus === 'BLOCKED' ? 'italic opacity-70' : ''}>{item.message}</p>
          {item.moderationStatus === 'FLAGGED' && <p className="mt-1 text-xs font-bold">Mensaje enviado a revisión</p>}
          {item.senderId !== currentUserId && item.moderationStatus !== 'BLOCKED' && <button type="button" onClick={() => {
            const reason = window.prompt('¿Por qué deseas reportar este mensaje?')
            if (reason) report.mutate({ messageId: item.id, reason })
          }} className="mt-2 text-xs underline opacity-80">Reportar mensaje</button>}
        </div>)}
      </div></QueryState>
      {(send.error || report.error) && <p className="mb-2 text-sm text-red-300">No fue posible completar la operación.</p>}
      <form onSubmit={submit} className="flex gap-2"><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Escribe un mensaje" /><button className="rounded-xl bg-brand-500 px-4 font-bold text-slate-950">Enviar</button></form>
    </div>
  </section>
}
