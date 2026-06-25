import { useEffect, useState, type ImgHTMLAttributes } from 'react'
import { api } from '../lib/api'
import { requiresAuthentication } from './privateAsset'

export function PrivateImage({ src, className, onLoad, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [resolvedSrc, setResolvedSrc] = useState<string>()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
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

  return <span className={`relative inline-block overflow-hidden align-middle ${className ?? ''}`}>
    {!loaded && <span className="absolute inset-0 z-10 grid place-items-center bg-slate-900/90">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" aria-label="Cargando imagen" />
    </span>}
    {resolvedSrc && <img
      src={resolvedSrc}
      className={className}
      onLoad={(event) => {
        setLoaded(true)
        onLoad?.(event)
      }}
      {...props}
    />}
  </span>
}
