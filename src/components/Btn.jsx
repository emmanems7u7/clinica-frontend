// Botón con icono Font Awesome y estado de carga (deshabilitado + spinner).
// icon: clase FA, p. ej. "fa-plus"
export default function Btn({ icon, loading = false, loadingText, variant = '', full = false, className = '', children, disabled, type = 'button', ...rest }) {
  const cls = ['btn', variant, full && 'full', loading && 'is-loading', className].filter(Boolean).join(' ')
  return (
    <button type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <i className="fas fa-circle-notch fa-spin" aria-hidden="true" /> : icon && <i className={`fas ${icon}`} aria-hidden="true" />}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  )
}
