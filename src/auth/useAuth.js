import { useEffect, useState, useCallback } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'

const MESSAGES = {
  'auth/popup-blocked': 'Tu navegador bloqueó la ventana de Google. Permite las ventanas emergentes para este sitio e inténtalo de nuevo.',
  'auth/network-request-failed': 'No hay conexión con Google. Revisa tu internet e inténtalo de nuevo.',
  'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase. Agrégalo en Authentication > Settings > Authorized domains.',
  'auth/operation-not-allowed': 'El acceso con Google no está activado en Firebase (Authentication > Sign-in method).',
}

// Errores que no merecen mensaje: la persona cerró la ventana a propósito.
const SILENT = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request']

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Firebase recuerda la sesión: aquí recuperamos al usuario al recargar.
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const signIn = useCallback(async () => {
    setError('')
    setBusy(true)
    try {
      await signInWithPopup(auth, googleProvider)
      return true
    } catch (e) {
      if (!SILENT.includes(e.code)) {
        setError(MESSAGES[e.code] || 'No pudimos iniciar sesión con Google. Inténtalo de nuevo.')
      }
      return false
    } finally {
      setBusy(false)
    }
  }, [])

  const logout = useCallback(() => signOut(auth), [])

  return { user, loading, busy, error, signIn, logout, clearError: () => setError('') }
}