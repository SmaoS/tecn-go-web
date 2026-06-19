export function formatCopCurrency(value?: number | null) {
  if (value == null || !Number.isFinite(value)) return 'Sin estimado'
  return `$${Math.round(value).toLocaleString('es-CO')} COP`
}
