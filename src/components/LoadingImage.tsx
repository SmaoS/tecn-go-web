import { useEffect, useState, type ImgHTMLAttributes } from 'react'

export function LoadingImage({ className, onLoad, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
  }, [props.src])

  return <span className={`relative inline-block overflow-hidden align-middle ${className ?? ''}`}>
    {!loaded && <span className="absolute inset-0 z-10 grid place-items-center bg-slate-900/90">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" aria-label="Cargando imagen" />
    </span>}
    {props.src && <img
      {...props}
      className={className}
      onLoad={(event) => {
        setLoaded(true)
        onLoad?.(event)
      }}
    />}
  </span>
}

export function FilePreviewImage({ file, ...props }: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & { file: File }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setSrc(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  return <LoadingImage {...props} src={src} />
}
