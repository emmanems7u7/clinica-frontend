import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { RESOURCES } from '../config/resources'

function CountUp({ to }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (typeof to !== 'number') return undefined
    let raf, start
    const tick = (t) => {
      start ??= t
      const p = Math.min((t - start) / 800, 1)
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to])
  if (to === undefined) return <span className="skel sk-num" />
  return to === null ? '—' : v
}

const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches' }

export default function Dashboard() {
  const { user, can } = useAuth()
  const [counts, setCounts] = useState({})
  const mine = Object.entries(RESOURCES).filter(([k]) => can(k))
  const today = new Date().toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => {
    mine.forEach(async ([k]) => {
      try { const d = await api(`/${k}?per_page=1`); setCounts((p) => ({ ...p, [k]: d.meta.total })) }
      catch { setCounts((p) => ({ ...p, [k]: null })) } // sin acceso
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="hero">
        <div>
          <h2>{greet()}, {user.name.split(' ')[0]}</h2>
          <p><i className="fas fa-calendar-day" /> {today}</p>
        </div>
      </div>
      <div className="stats">
        {mine.map(([k, r], i) => (
          <Link to={`/${k}`} className="stat" key={k} style={{ '--c': r.color, '--i': i }}>
            <span className="i"><i className={`fas ${r.icon}`} /></span>
            <span className="n"><CountUp to={counts[k]} /></span>
            <span className="l">{r.title}</span>
            <i className="fas fa-arrow-right go" />
          </Link>
        ))}
      </div>
    </>
  )
}
