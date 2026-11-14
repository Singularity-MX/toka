
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from 'react'

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'firebase/auth'

import { auth, googleProvider } from '../services/firebase'

const MESSAGES = {
  'auth/popup-blocked': 'Tu navegador bloqueó la ventana de Google.',
  'auth/network-request-failed': 'No hay conexión con Google.',
  'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase.',
  'auth/operation-not-allowed': 'El acceso con Google no está activado en Firebase.'
}

const SILENT = [
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request'
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = useCallback(async () => {
    setError('')
    setBusy(true)

    try {
      await signInWithPopup(auth, googleProvider)
      return true
    } catch (e) {
      if (!SILENT.includes(e.code)) {
        setError(
          MESSAGES[e.code] ||
          'No pudimos iniciar sesión con Google. Inténtalo de nuevo.'
        )
      }

      return false
    } finally {
      setBusy(false)
    }
  }, [])

  const logout = useCallback(() => signOut(auth), [])

  const clearError = useCallback(() => setError(''), [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        busy,
        error,
        signIn,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  }

  return context
}
