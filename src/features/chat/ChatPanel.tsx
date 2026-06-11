import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { api } from '../../lib/api'
import type { ChatMessage, ServiceRequest } from '../../types'

export function ChatPanel({ request, currentUserId, onClose }: {
  request: ServiceRequest
  currentUserId: string
  onClose: () => void
}) {
  const [text, setText] = useState('')
  const client = useQueryClient()
  const key = ['chat', request.id] as const
  const messages = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get<ChatMessage[]>(`/v1/service-requests/${request.id}/chat`)
      await api.put(`/v1/service-requests/${request.id}/chat/read`)
      return data
    },
    refetchInterval: 5_000,
  })
  const send = useMutation({
    mutationFn: (message: string) => api.post(`/v1/service-requests/${request.id}/chat/messages`, { message }),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  })
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!text.trim()) return
    send.mutate(text, { onSuccess: () => setText('') })
  }
  return <section className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4">
    <div className="w-full max-w-xl rounded-3xl border border-slate-700 bg-slate-900 p-6">
      <div className="flex justify-between"><h2 className="text-xl font-bold">Chat · {request.categoryName}</h2><button onClick={onClose}>Cerrar</button></div>
      <div className="my-4 max-h-80 space-y-2 overflow-y-auto">
        {(messages.data?.length ?? 0) === 0 && <p className="text-slate-500">Inicia la conversación.</p>}
        {messages.data?.map((item) => <div key={item.id} className={`max-w-[80%] rounded-xl p-3 ${item.senderId === currentUserId ? 'ml-auto bg-brand-500 text-slate-950' : 'bg-slate-800'}`}>
          <p className="text-xs font-bold">{item.senderName}</p><p>{item.message}</p>
        </div>)}
      </div>
      <form onSubmit={submit} className="flex gap-2"><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Escribe un mensaje" /><button className="rounded-xl bg-brand-500 px-4 font-bold text-slate-950">Enviar</button></form>
    </div>
  </section>
}
