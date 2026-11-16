const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1'

let token = sessionStorage.getItem('tk')
let onUnauthorized = () => {}

export const getToken = () => token
export const setToken = (t) => {
  token = t
  t ? sessionStorage.setItem('tk', t) : sessionStorage.removeItem('tk')
}
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn }

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 401 && token) {
    onUnauthorized()
    throw { status: 401, message: 'Su sesión expiró. Ingrese de nuevo.' }
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw { status: res.status, message: data?.message || `Error ${res.status}`, errors: data?.errors }
  return data
}
