import { STATUS } from '../config/resources'

function Cell({ c, row, canEdit, onStatus, disabled }) {
  const v = c.value(row)
  if (c.type === 'status' && canEdit) {
    return (
      <select className={`inline st-${row.status}`} value={row.status} disabled={disabled} onChange={(e) => onStatus(row, e.target.value)}>
        {STATUS.map(([val, l]) => <option key={val} value={val}>{l}</option>)}
      </select>
    )
  }
  if (c.type === 'status') return <span className={`badge b-${v}`}>{STATUS.find(([k]) => k === v)?.[1] ?? v}</span>
  if (c.type === 'badge') return <span className={`badge b-${v}`}>{c.labels?.[v] ?? v}</span>
  if (c.type === 'bool') return <span className={`pill ${v ? 'on' : 'off'}`}><i className={`fas ${v ? 'fa-circle-check' : 'fa-circle-minus'}`} />{v ? 'Activo' : 'Inactivo'}</span>
  if (c.type === 'method') return <span className="method"><i className={`fas ${c.icons?.[v] || 'fa-money-bill'}`} />{c.labels?.[v] ?? v}</span>
  return v ?? <span className="dash">—</span>
}

export default function DataTable({ cfg, rows, loading, busyId, canEdit, canDelete, onEdit, onDelete, onStatus }) {
  if (!rows.length && loading) {
    return (
      <div className="tbl skeleton" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="sk-row" key={i}>{cfg.cols.map((c) => <span key={c.label} className="skel" />)}</div>
        ))}
      </div>
    )
  }
  if (!rows.length) {
    return (
      <div className="empty">
        <div className="empty-ic"><i className={`fas ${cfg.icon}`} /></div>
        <h4>Aún no hay registros</h4>
        <p>Cree el primero con el botón «Nuevo» o pruebe con otra búsqueda.</p>
      </div>
    )
  }

  return (
    <div className={`tbl ${loading ? 'dim' : ''}`}>
      <table>
        <thead>
          <tr>{cfg.cols.map((c) => <th key={c.label}>{c.label}</th>)}<th className="act-h">Acciones</th></tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const busy = busyId === row.id
            return (
              <tr key={row.id} className={busy ? 'row-busy' : ''} style={{ '--i': i }}>
                {cfg.cols.map((c, ci) => (
                  <td key={c.label} className={ci === 0 ? 'first' : ''}>
                    <Cell c={c} row={row} canEdit={canEdit} onStatus={onStatus} disabled={busy} />
                  </td>
                ))}
                <td className="act">
                  {busy && <i className="fas fa-circle-notch fa-spin spin-row" />}
                  {canEdit && <button className="ic edit" title="Editar" disabled={busy} onClick={() => onEdit(row)}><i className="fas fa-pen-to-square" /></button>}
                  {canDelete && (
                    <button className="ic del" title={cfg.soft ? 'Desactivar' : 'Eliminar'} disabled={busy} onClick={() => onDelete(row)}>
                      <i className={`fas ${cfg.soft ? 'fa-ban' : 'fa-trash-can'}`} />
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
