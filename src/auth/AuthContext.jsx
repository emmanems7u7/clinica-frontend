import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, getToken, setToken, setUnauthorizedHandler } from '../api/client'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perms, setPerms] = useState([])
  const [loading, setLoading] = useState(!!getToken())

  const clear = useCallback(() => { setToken(null); setUser(null); setPerms([]) }, [])

  const loadMe = useCallback(async () => {
    const d = await api('/auth/me')
    setUser(d.data)
    setPerms(d.permissions || [])
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(clear)
    if (getToken()) loadMe().catch(clear).finally(() => setLoading(false))
  }, [clear, loadMe])

  const login = async (email, password) => {
    const d = await api('/auth/login', { method: 'POST', body: { email, password, device_name: 'web' } })
    setToken(d.token)
    await loadMe()
  }

  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST' }) } catch { /* token ya inválido */ }
    clear()
  }

  const value = useMemo(() => ({
    user, loading, login, logout,
    can: (resource, action = 'view') => perms.includes(`${resource}.${action}`),
  }), [user, perms, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
