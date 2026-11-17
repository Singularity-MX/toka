import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// Estos valores no son secretos (identifican tu proyecto, no lo protegen).
// La seguridad real está en las reglas de Firebase y en los dominios autorizados.
const firebaseConfig = {
  apiKey: "AIzaSyBZp3mkkQxe4WjuHYLe52p36C5k7T98iM8",
  authDomain: "toka-e8a57.firebaseapp.com",
  projectId: "toka-e8a57",
  storageBucket: "toka-e8a57.firebasestorage.app",
  messagingSenderId: "634326597602",
  appId: "1:634326597602:web:f65082dc01a7357c7103bb",
  measurementId: "G-P9V2ME2EPR"
};

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
