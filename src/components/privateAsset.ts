import { api } from '../lib/api'

export function requiresAuthentication(url: string) {
  return url.startsWith('/v1/files/') || url.startsWith('/files/')
}

export async function openPrivateAsset(url: string) {
  if (!requiresAuthentication(url)) {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }
  const response = await api.get<Blob>(url, { responseType: 'blob' })
  const objectUrl = URL.createObjectURL(response.data)
  window.open(objectUrl, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
}
