import { useCallback, useRef, useState } from 'react'

// Ejecuta una acción async una sola vez a la vez.
// El ref bloquea al instante (antes de que React repinte), así un doble clic
// o un Enter repetido nunca envía dos veces.
export function useLock() {
  const lock = useRef(false)
  const [busy, setBusy] = useState(false)
  const run = useCallback(async (fn) => {
    if (lock.current) return undefined
    lock.current = true
    setBusy(true)
    try { return await fn() }
    finally { lock.current = false; setBusy(false) }
  }, [])
  return [busy, run]
}
