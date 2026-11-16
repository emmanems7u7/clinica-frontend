import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useLock } from '../hooks/useLock'
import Btn from '../components/Btn'
import Logo from '../components/Logo'

const FEATURES = [
  ['fa-user-injured', 'Pacientes y odontólogos'],
  ['fa-calendar-check', 'Agenda de citas sin solapamientos'],
  ['fa-file-medical', 'Historias clínicas'],
  ['fa-credit-card', 'Pagos y tratamientos'],
]

export default function Login() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(0)
  const [busy, run] = useLock()

  if (user) return <Navigate to="/" replace />

  function submit(e) {
    e.preventDefault()
    run(async () => {
      setError('')
      try { await login(email, password) }
      catch (err) { setError(err.errors?.email?.[0] || err.message); setShake((n) => n + 1) }
    })
  }

  return (
    <div className="login">
      <div className="login-art">
        <span className="bubble b1" /><span className="bubble b2" /><span className="bubble b3" />
        <div className="art-in">
          <Logo size={72} className="float" />
          <h1>Su clínica,<br />en orden.</h1>
          <p>Pacientes, citas, historias clínicas y pagos en un solo lugar.</p>
          <ul>
            {FEATURES.map(([ic, t], i) => (
              <li key={t} style={{ '--i': i }}><span><i className={`fas ${ic}`} /></span>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="login-side">
        <form onSubmit={submit} className={error ? 'has-error' : ''}>
          <div className="mobile-logo"><Logo size={44} /></div>
          <h2>Bienvenido</h2>
          <p className="sub">Ingrese con su cuenta para continuar.</p>

          <label htmlFor="em">Correo</label>
          <div className="input-ic">
            <i className="fas fa-envelope" />
            <input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus disabled={busy} autoComplete="username" placeholder="usuario@clinica.com" />
          </div>

          <label htmlFor="pw">Contraseña</label>
          <div className="input-ic">
            <i className="fas fa-lock" />
            <input id="pw" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required disabled={busy} autoComplete="current-password" placeholder="••••••••••" />
            <button type="button" className="eye" tabIndex={-1} onClick={() => setShow(!show)} aria-label="Mostrar u ocultar contraseña">
              <i className={`fas ${show ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>

          {error && <div className="alert" key={shake}><i className="fas fa-circle-exclamation" />{error}</div>}

          <Btn type="submit" full icon="fa-right-to-bracket" loading={busy} loadingText="Ingresando…">Ingresar</Btn>
        </form>
      </div>
    </div>
  )
}
