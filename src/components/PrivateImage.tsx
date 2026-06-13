import { useEffect, useState, type ImgHTMLAttributes } from 'react'
import { api } from '../lib/api'
import { requiresAuthentication } from './privateAsset'

export function PrivateImage({ src, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [resolvedSrc, setResolvedSrc] = useState<string>()

  useEffect(() => {
    if (!src) {
      setResolvedSrc(undefined)
      return
    }
    if (!requiresAuthentication(src)) {
      setResolvedSrc(src)
      return
    }

    let active = true
    let objectUrl: string | undefined
    void api.get<Blob>(src, { responseType: 'blob' }).then((response) => {
      if (!active) return
      objectUrl = URL.createObjectURL(response.data)
      setResolvedSrc(objectUrl)
    }).catch(() => {
      if (active) setResolvedSrc(undefined)
    })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src])

  if (!resolvedSrc) return null
  return <img src={resolvedSrc} {...props} />
}
