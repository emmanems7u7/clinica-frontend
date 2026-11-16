import { useEffect, useRef, useState } from 'react'
import { api } from '../api/client'
import { useToast } from './Toast'
import { useLock } from '../hooks/useLock'
import Btn from './Btn'
import Loader from './Loader'

// Carga las listas que alimentan los <select> remotos (pacientes, odontólogos, roles…)
function useRemote(fields) {
  const [data, setData] = useState({})
  useEffect(() => {
    fields.filter((f) => f.type === 'remote').forEach(async (f) => {
      try {
        const d = await api(`/${f.src}${f.src === 'roles' ? '' : '?per_page=100'}`)
        const list = (d.data || d).map((x) => (typeof x === 'string' ? { id: x, name: x } : x))
        setData((p) => ({ ...p, [f.src]: list }))
      } catch { setData((p) => ({ ...p, [f.src]: [] })) }
    })
  }, [fields])
  return data
}

export default function FormModal({ cfg, resource, row, onClose, onSaved }) {
  const toast = useToast()
  const remote = useRemote(cfg.fields)
  const [form, setForm] = useState(() => Object.fromEntries(cfg.fields.map((f) => {
    const v = row ? (f.get ? f.get(row) : row[f.key]) : f.def
    return [f.key, v ?? (f.type === 'check' ? false : '')]
  })))
  const [errors, setErrors] = useState({})
  const [shake, setShake] = useState(0)
  const [showPass, setShowPass] = useState({})
  const [busy, run] = useLock()
  const first = useRef()
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  // Escape cierra, salvo mientras se está guardando
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !busy && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])
  useEffect(() => { first.current?.focus() }, [])

  function submit(e) {
    e.preventDefault()
    run(async () => {
      setErrors({})
      let payload = {}
      cfg.fields.forEach((f) => {
        const v = form[f.key]
        if (f.type === 'password' && row && !v) return // al editar, vacío = no cambiar
        payload[f.key] = v === '' ? null : v
      })
      if (cfg.out) payload = cfg.out(payload)
      try {
        await api(`/${resource}${row ? `/${row.id}` : ''}`, { method: row ? 'PUT' : 'POST', body: payload })
        toast(row ? 'Cambios guardados correctamente' : 'Registro creado correctamente')
        onSaved()
      } catch (err) {
        setErrors({ ...(err.errors || {}), _: err.errors ? null : err.message })
        setShake((n) => n + 1)
      }
    })
  }

  const invalid = (k) => !!errors[k]?.length

  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <form className="sheet" onSubmit={submit} noValidate={false}>
        {busy && <Loader overlay text="Guardando…" />}
        <div className="sheet-head">
          <div className="sh-ic" style={{ '--c': cfg.color }}><i className={`fas ${cfg.icon}`} /></div>
          <div>
            <h3>{row ? 'Editar registro' : 'Nuevo registro'}</h3>
            <small>{cfg.title}</small>
          </div>
          <button type="button" className="x" onClick={onClose} disabled={busy} aria-label="Cerrar"><i className="fas fa-xmark" /></button>
        </div>

        {errors._ && <div className="alert" key={shake}><i className="fas fa-circle-exclamation" />{errors._}</div>}

        <div className="grid">
          {cfg.fields.map((f, idx) => {
            const ref = idx === 0 ? first : undefined
            return (
              <div key={f.key} className={`field ${f.wide ? 'wide' : ''} ${invalid(f.key) ? 'invalid' : ''}`}>
                {f.type === 'check' ? (
                  <label className="switch">
                    <input type="checkbox" checked={!!form[f.key]} onChange={(e) => set(f.key, e.target.checked)} />
                    <span className="track" /> <span>{f.label}</span>
                  </label>
                ) : (
                  <>
                    <label>{f.label}{f.req && !(row && f.type === 'password') && <em> *</em>}</label>
                    {f.type === 'area' ? (
                      <textarea ref={ref} rows="3" value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />
                    ) : f.type === 'select' ? (
                      <select ref={ref} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)}>
                        <option value="">Seleccione…</option>
                        {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    ) : f.type === 'remote' ? (
                      <select ref={ref} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} disabled={!remote[f.src]}>
                        <option value="">{remote[f.src] ? 'Seleccione…' : 'Cargando…'}</option>
                        {(remote[f.src] || []).map((o) => <option key={o[f.val || 'id']} value={o[f.val || 'id']}>{f.label_fn(o)}</option>)}
                      </select>
                    ) : f.type === 'password' ? (
                      <div className="pw">
                        <input
                          ref={ref} type={showPass[f.key] ? 'text' : 'password'} autoComplete="new-password"
                          value={form[f.key]} onChange={(e) => set(f.key, e.target.value)}
                        />
                        <button type="button" tabIndex={-1} onClick={() => setShowPass((p) => ({ ...p, [f.key]: !p[f.key] }))} aria-label="Mostrar u ocultar contraseña">
                          <i className={`fas ${showPass[f.key] ? 'fa-eye-slash' : 'fa-eye'}`} />
                        </button>
                      </div>
                    ) : (
                      <input
                        ref={ref} type={f.type || 'text'} step={f.type === 'number' ? '0.01' : undefined}
                        value={form[f.key]} onChange={(e) => set(f.key, e.target.value)}
                      />
                    )}
                  </>
                )}
                {errors[f.key]?.map((m) => <div className="err" key={m}><i className="fas fa-circle-exclamation" />{m}</div>)}
              </div>
            )
          })}
        </div>

        <div className="foot">
          <Btn variant="ghost" icon="fa-xmark" onClick={onClose} disabled={busy}>Cancelar</Btn>
          <Btn type="submit" icon="fa-floppy-disk" loading={busy} loadingText="Guardando…">Guardar cambios</Btn>
        </div>
      </form>
    </div>
  )
}
