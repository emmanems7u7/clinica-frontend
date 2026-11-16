import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(() => {})
export const useToast = () => useContext(ToastContext)

const KINDS = {
  success: { icon: 'fa-circle-check', title: 'Listo' },
  error: { icon: 'fa-circle-xmark', title: 'Error' },
  info: { icon: 'fa-circle-info', title: 'Aviso' },
}
const TIME = 4000

// toast('Mensaje')  → éxito · toast('Mensaje', true) → error · toast('Mensaje', 'info')
export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const seq = useRef(0)

  const remove = useCallback((id) => setItems((p) => p.filter((t) => t.id !== id)), [])
  const show = useCallback((msg, kind = 'success') => {
    const k = kind === true ? 'error' : kind === false ? 'success' : kind
    const id = ++seq.current
    setItems((p) => [...p.slice(-3), { id, msg, kind: k }])
    setTimeout(() => remove(id), TIME)
  }, [remove])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toasts" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`} role="status">
            <i className={`fas ${KINDS[t.kind].icon} t-ic`} aria-hidden="true" />
            <div className="t-body"><b>{KINDS[t.kind].title}</b><span>{t.msg}</span></div>
            <button className="t-x" onClick={() => remove(t.id)} aria-label="Cerrar"><i className="fas fa-xmark" /></button>
            <i className="t-bar" style={{ animationDuration: `${TIME}ms` }} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
