import Logo from './Logo'

// Pantalla / panel de carga con el logo animado
export default function Loader({ text = 'Cargando…', overlay = false }) {
  return (
    <div className={`loader ${overlay ? 'loader-overlay' : 'loader-full'}`} role="status" aria-live="polite">
      <div className="loader-mark">
        <span className="loader-ring" />
        <Logo size={overlay ? 44 : 56} />
      </div>
      <p>{text}</p>
    </div>
  )
}
