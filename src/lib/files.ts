import { api } from './api'

export async function uploadFile(file: File, kind: 'PROFILE' | 'DOCUMENT' | 'CERTIFICATE' = 'DOCUMENT') {
  const body = new FormData()
  body.append('file', file)
  body.append('kind', kind)
  const { data } = await api.post<{ url: string }>('/v1/files/upload', body)
  return data.url
}
