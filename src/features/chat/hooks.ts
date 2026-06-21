import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatApi } from './api'
import type { ChatMessage } from '../../types'

const chatKey = (requestId: string) => ['chat', requestId] as const

export const useChat = (requestId: string) => {
  const client = useQueryClient()
  return useQuery({
    queryKey: chatKey(requestId),
    queryFn: async () => {
      const current = client.getQueryData<ChatMessage[]>(chatKey(requestId)) ?? []
      const messages = await chatApi.messages(requestId, current.at(-1)?.createdAt)
      await chatApi.read(requestId)
      const byId = new Map(current.map((item) => [item.id, item]))
      messages.forEach((item) => byId.set(item.id, item))
      return [...byId.values()].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
    },
    refetchInterval: 5_000,
  })
}
export function useSendMessage(requestId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (message: string) => chatApi.send(requestId, message),
    onSuccess: () => client.invalidateQueries({ queryKey: chatKey(requestId) }),
  })
}

export function useReportMessage(requestId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ messageId, reason }: { messageId: string; reason: string }) =>
      chatApi.report(messageId, reason),
    onSuccess: () => client.invalidateQueries({ queryKey: chatKey(requestId) }),
  })
}
