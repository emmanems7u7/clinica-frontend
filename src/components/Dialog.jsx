import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import Btn from './Btn'

const DialogContext = createContext({ confirm: async () => false, ask: async () => null })
export const useDialog = () => useContext(DialogContext)

// Reemplaza confirm() y prompt() del navegador por diálogos propios.
//   await confirm({ title, message, confirmText, danger, icon }) → true / false
//   await ask({ title, message, label, confirmText })            → texto / null
export function DialogProvider({ children }) {
  const [d, setD] = useState(null)
  const [val, setVal] = useState('')
  const input = useRef()

  const api = useMemo(() => {
    const open = (cfg) => new Promise((resolve) => { setVal(''); setD({ ...cfg, resolve }) })
    return { confirm: (c) => open({ ...c, kind: 'confirm' }), ask: (c) => open({ ...c, kind: 'ask' }) }
  }, [])

  const close = (result) => { d.resolve(result); setD(null) }
  const cancel = () => close(d.kind === 'ask' ? null : false)
  const accept = () => {
    if (d.kind === 'ask') { if (!val.trim()) return input.current?.focus(); close(val.trim()) }
    else close(true)
  }

  useEffect(() => {
    if (!d) return
    const onKey = (e) => e.key === 'Escape' && cancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }) // eslint-disable-line

  return (
    <DialogContext.Provider value={api}>
      {children}
      {d && (
        <div className="modal modal-sm" onMouseDown={(e) => e.target === e.currentTarget && cancel()}>
          <div className="dialog" role="alertdialog" aria-modal="true">
            <div className={`dlg-ic ${d.danger ? 'danger' : ''}`}>
              <i className={`fas ${d.icon || (d.danger ? 'fa-triangle-exclamation' : d.kind === 'ask' ? 'fa-comment-dots' : 'fa-circle-question')}`} />
            </div>
            <h3>{d.title}</h3>
            {d.message && <p>{d.message}</p>}
            {d.kind === 'ask' && (
              <textarea ref={input} autoFocus rows="3" placeholder={d.label || 'Escriba aquí…'} value={val} onChange={(e) => setVal(e.target.value)} />
            )}
            <div className="dlg-foot">
              <Btn variant="ghost" icon="fa-xmark" onClick={cancel}>Cancelar</Btn>
              <Btn variant={d.danger ? 'danger' : ''} icon={d.danger ? 'fa-trash-can' : 'fa-check'} onClick={accept} autoFocus={d.kind !== 'ask'}>
                {d.confirmText || 'Aceptar'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  )
}
