import { useState, type InputHTMLAttributes } from 'react'

export function PasswordField(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false)
  return <div className="relative">
    <input {...props} type={visible ? 'text' : 'password'} className="pr-20 text-slate-100 caret-brand-400" />
    <button
      type="button"
      onClick={() => setVisible((value) => !value)}
      className="absolute inset-y-0 right-3 text-sm text-brand-300"
      aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {visible ? 'Ocultar' : 'Mostrar'}
    </button>
  </div>
}
