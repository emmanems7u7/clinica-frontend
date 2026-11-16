import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../components/Toast'
import { useDialog } from '../components/Dialog'
import Btn from '../components/Btn'
import DataTable from '../components/DataTable'
import FormModal from '../components/FormModal'
import { RESOURCES } from '../config/resources'

// Ventana de páginas: 1 … 4 5 [6] 7 8 … 20
function pages(cur, last) {
  const set = new Set([1, last, cur - 1, cur, cur + 1])
  const list = [...set].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b)
  return list.flatMap((n, i) => (i && n - list[i - 1] > 1 ? ['…' + n, n] : [n]))
}

export default function ResourcePage() {
  const { resource } = useParams()
  const cfg = RESOURCES[resource]
  const { can } = useAuth()
  const toast = useToast()
  const { confirm, ask } = useDialog()
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({})
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState(null) // fila con acción en curso (evita doble clic)
  const [editing, setEditing] = useState(null) // null = cerrado, {} = nuevo, fila = editar
  const timer = useRef()
  const seq = useRef(0)

  const load = useCallback(async (p = page, search = q) => {
    const id = ++seq.current
    setLoading(true)
    try {
      const d = await api(`/${resource}?page=${p}&per_page=10&search=${encodeURIComponent(search)}`)
      if (id !== seq.current) return // llegó una respuesta más nueva
      setRows(d.data); setMeta(d.meta || {})
    } catch (e) { if (id === seq.current) toast(e.message, true) }
    finally { if (id === seq.current) setLoading(false) }
  }, [resource, page, q, toast])

  // al cambiar de módulo se reinicia todo
  useEffect(() => { setRows([]); setMeta({}); setQ(''); setPage(1); setEditing(null); load(1, '') }, [resource]) // eslint-disable-line

  if (!cfg || !can(resource)) return <Navigate to="/" replace />

  const search = (v) => {
    setQ(v); clearTimeout(timer.current)
    timer.current = setTimeout(() => { setPage(1); load(1, v) }, 350)
  }
  const go = (p) => { setPage(p); load(p) }
  const last = meta.last_page || 1

  async function remove(row) {
    if (busyId) return
    const ok = await confirm({
      title: cfg.soft ? 'Desactivar registro' : 'Eliminar registro',
      message: cfg.soft ? 'El registro quedará inactivo. ¿Desea continuar?' : 'Esta acción no se puede deshacer. ¿Desea continuar?',
      confirmText: cfg.soft ? 'Desactivar' : 'Eliminar', danger: true, icon: cfg.soft ? 'fa-ban' : 'fa-trash-can',
    })
    if (!ok) return
    setBusyId(row.id)
    try { await api(`/${resource}/${row.id}`, { method: 'DELETE' }); toast(cfg.soft ? 'Registro desactivado' : 'Registro eliminado'); await load() }
    catch (e) { toast(e.message, true) }
    finally { setBusyId(null) }
  }

  async function changeStatus(row, status) {
    if (busyId) return
    const body = { status }
    if (status === 'cancelled') {
      const reason = await ask({ title: 'Cancelar cita', message: 'Indique el motivo de la cancelación.', label: 'Motivo de la cancelación…', confirmText: 'Cancelar cita', icon: 'fa-calendar-xmark' })
      if (!reason) return load()
      body.cancelled_reason = reason
    }
    setBusyId(row.id)
    try { await api(`/appointments/${row.id}/status`, { method: 'PATCH', body }); toast('Estado actualizado'); await load() }
    catch (e) { toast(e.message, true); await load() }
    finally { setBusyId(null) }
  }

  const from = meta.total ? (page - 1) * 10 + 1 : 0
  const to = Math.min(page * 10, meta.total || 0)

  return (
    <>
      <div className="head">
        <div className="title">
          <span className="t-ic" style={{ '--c': cfg.color }}><i className={`fas ${cfg.icon}`} /></span>
          <div><h2>{cfg.title}</h2><small>{meta.total ?? '…'} registros en total</small></div>
        </div>
        {can(resource, 'create') && <Btn icon="fa-plus" onClick={() => setEditing({})}>Nuevo</Btn>}
      </div>

      <div className="panel">
        <div className={`progress ${loading ? 'on' : ''}`}><i /></div>
        <div className="tools">
          <div className="search">
            <i className="fas fa-magnifying-glass" />
            <input placeholder="Buscar…" value={q} onChange={(e) => search(e.target.value)} />
            {q && <button onClick={() => search('')} aria-label="Limpiar búsqueda"><i className="fas fa-circle-xmark" /></button>}
          </div>
          <Btn variant="ghost" icon="fa-rotate" loading={loading} onClick={() => load()}>Actualizar</Btn>
        </div>

        <DataTable
          cfg={cfg} rows={rows} loading={loading} busyId={busyId}
          canEdit={can(resource, 'update')} canDelete={can(resource, 'delete')}
          onEdit={setEditing} onDelete={remove} onStatus={changeStatus}
        />

        <div className="pager">
          <span>{from}–{to} de {meta.total || 0}</span>
          <span className="pg">
            <button className="pgb" disabled={page <= 1 || loading} onClick={() => go(page - 1)} aria-label="Anterior"><i className="fas fa-chevron-left" /></button>
            {pages(page, last).map((n) => (
              typeof n === 'string'
                ? <span key={n} className="dots">…</span>
                : <button key={n} className={`pgb ${n === page ? 'on' : ''}`} disabled={loading} onClick={() => n !== page && go(n)}>{n}</button>
            ))}
            <button className="pgb" disabled={page >= last || loading} onClick={() => go(page + 1)} aria-label="Siguiente"><i className="fas fa-chevron-right" /></button>
          </span>
        </div>
      </div>

      {editing && (
        <FormModal
          key={editing.id || 'new'} cfg={cfg} resource={resource} row={editing.id ? editing : null}
          onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }}
        />
      )}
    </>
  )
}
