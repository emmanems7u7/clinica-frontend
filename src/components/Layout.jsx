import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { RESOURCES } from '../config/resources'
import { useDialog } from './Dialog'
import { useLock } from '../hooks/useLock'
import Logo from './Logo'

export const initials = (n = '') => n.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join('')

export default function Layout() {
  const { user, logout, can } = useAuth()
  const { confirm } = useDialog()
  const [open, setOpen] = useState(false)
  const [busy, run] = useLock()
  const { pathname } = useLocation()
  const current = RESOURCES[pathname.split('/')[1]]

  async function onLogout() {
    const ok = await confirm({ title: 'Cerrar sesión', message: '¿Desea salir del sistema?', confirmText: 'Cerrar sesión', icon: 'fa-right-from-bracket' })
    if (ok) run(logout)
  }

  return (
    <div className="layout">
      {open && <div className="backdrop" onClick={() => setOpen(false)} />}
      <aside className={open ? 'open' : ''}>
        <div className="brand">
          <Logo size={36} />
          <div><b>Clínica</b><small>Odontológica</small></div>
        </div>
        <nav onClick={() => setOpen(false)}>
          <NavLink to="/" end><i className="fas fa-house" /><span>Inicio</span></NavLink>
          {Object.entries(RESOURCES).filter(([k]) => can(k)).map(([k, r]) => (
            <NavLink key={k} to={`/${k}`}><i className={`fas ${r.icon}`} /><span>{r.title}</span></NavLink>
          ))}
        </nav>
        <div className="me">
          <div className="avatar">{initials(user.name)}</div>
          <div className="me-info"><b>{user.name}</b><small>{user.roles?.join(', ')}</small></div>
          <button className="me-out" onClick={onLogout} disabled={busy} title="Cerrar sesión" aria-label="Cerrar sesión">
            <i className={`fas ${busy ? 'fa-circle-notch fa-spin' : 'fa-right-from-bracket'}`} />
          </button>
        </div>
      </aside>
      <div className="content">
        <header className="topbar">
          <button className="burger" onClick={() => setOpen(!open)} aria-label="Menú"><i className="fas fa-bars" /></button>
          <div className="crumbs">
            <i className="fas fa-house" /> <span>Inicio</span>
            {current && <><i className="fas fa-chevron-right sep" /><b>{current.title}</b></>}
          </div>
          <div className="top-user"><span>{user.name}</span><div className="avatar sm">{initials(user.name)}</div></div>
        </header>
        <main key={pathname} className="page-in"><Outlet /></main>
      </div>
    </div>
  )
}
