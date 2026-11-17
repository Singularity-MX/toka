import { useEffect, useRef } from 'react'

export function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  )
}

export default function AuthModal({ open, onClose, onSignIn, busy, error }) {
  const ref = useRef(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  const handleSignIn = async () => {
    const ok = await onSignIn()
    if (ok) onClose()
  }

  return (
    <dialog
      ref={ref}
      className="auth-modal"
      aria-labelledby="auth-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="auth-box">
        <button type="button" className="auth-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <h2 id="auth-title">Crea tu cuenta o inicia sesión</h2>
        <p>Usa tu cuenta de Google. Si es tu primera vez, Toka crea tu cuenta automáticamente.</p>

        <button type="button" className="google-btn" onClick={handleSignIn} disabled={busy}>
          <GoogleLogo />
          {busy ? 'Abriendo Google…' : 'Continuar con Google'}
        </button>

        {error && (
          <p role="alert" className="auth-error">
            {error}
          </p>
        )}

        <p className="fine">
          Solo guardamos tu nombre, tu correo y tu foto para identificar tu cuenta y tus parcelas.
        </p>
      </div>
    </dialog>
  )
}
