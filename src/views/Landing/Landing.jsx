import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './Landing.css'

import { useAuth } from '../../auth/useAuth'
import { auth } from '../../services/firebase'

import AuthModal, { GoogleLogo } from './components/AuthModal'
import { urlBackend } from '../../config/backend.config'
const ROTATIONS = [
  {
    id: 'actual',
    name: 'Tu rotación actual',
    note: 'Maíz y barbecho: el suelo pasa meses desnudo y se erosiona.',
    cycles: [
      { crop: 'Maíz', color: '#D9A92E' },
      { crop: 'Barbecho', color: '#8A6A4B', bare: true },
      { crop: 'Maíz', color: '#D9A92E' },
      { crop: 'Barbecho', color: '#8A6A4B', bare: true },
    ],
    scores: { agua: 20, suelo: 25, ingreso: 60 },
  },
  {
    id: 'frijol',
    name: 'Maíz y frijol',
    note: 'El frijol fija nitrógeno y reduce la necesidad de fertilizante.',
    cycles: [
      { crop: 'Maíz', color: '#D9A92E' },
      { crop: 'Frijol', color: '#5B7F3A' },
      { crop: 'Maíz', color: '#D9A92E' },
      { crop: 'Frijol', color: '#5B7F3A' },
    ],
    scores: { agua: 45, suelo: 60, ingreso: 65 },
  },
  {
    id: 'cobertura',
    name: 'Sorgo, cobertura y garbanzo',
    note: 'Cultivos tolerantes a sequía y una cobertura que protege el suelo en invierno.',
    cycles: [
      { crop: 'Sorgo', color: '#A4452F' },
      { crop: 'Avena con vicia', color: '#7DB08A' },
      { crop: 'Maíz', color: '#D9A92E' },
      { crop: 'Garbanzo', color: '#C9B27A' },
    ],
    scores: { agua: 70, suelo: 80, ingreso: 55 },
  },
]

const METRICS = [
  ['agua', 'Ahorro de agua'],
  ['suelo', 'Salud del suelo'],
  ['ingreso', 'Ingreso'],
]

const ICONS = {
  pin: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <polygon points="8,16 28,8 42,18 38,38 18,42 6,32" fill="#cfe3c4" stroke="#16312b" strokeWidth="2.5" strokeLinejoin="round" />
      {[[8, 16], [28, 8], [42, 18], [38, 38], [18, 42], [6, 32]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="3.2" fill="#fff" stroke="#16312b" strokeWidth="2" />
      ))}
    </svg>
  ),
  sliders: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <g stroke="#16312b" strokeWidth="2.5" strokeLinecap="round">
        <line x1="8" y1="14" x2="40" y2="14" />
        <line x1="8" y1="24" x2="40" y2="24" />
        <line x1="8" y1="34" x2="40" y2="34" />
      </g>
      <circle cx="16" cy="14" r="5" fill="#2f6f8f" stroke="#16312b" strokeWidth="2" />
      <circle cx="30" cy="24" r="5" fill="#e6c66a" stroke="#16312b" strokeWidth="2" />
      <circle cx="21" cy="34" r="5" fill="#5b7f3a" stroke="#16312b" strokeWidth="2" />
    </svg>
  ),
  compare: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <rect x="6" y="26" width="10" height="16" rx="2" fill="#8a6a4b" stroke="#16312b" strokeWidth="2.5" />
      <rect x="19" y="16" width="10" height="26" rx="2" fill="#5b7f3a" stroke="#16312b" strokeWidth="2.5" />
      <rect x="32" y="6" width="10" height="36" rx="2" fill="#2f6f8f" stroke="#16312b" strokeWidth="2.5" />
    </svg>
  ),
}

const STEPS = [
  {
    icon: 'pin',
    title: 'Marca tu parcela',
    text: 'Dibuja sobre el mapa el contorno real de tu terreno. Puedes guardar varias parcelas en tu cuenta.',
  },
  {
    icon: 'sliders',
    title: 'Dinos qué te importa',
    text: 'Ahorrar agua, mejorar el suelo, ganar más o usar menos fertilizante. También tu equipo y tus mercados.',
  },
  {
    icon: 'compare',
    title: 'Compara tres rotaciones',
    text: 'Toka te muestra tu rotación actual y dos alternativas, con la evidencia, los beneficios y lo que aún no sabemos.',
  },
]

const LAYERS = [
  { name: 'SMAP', what: ['Humedad del suelo'], color: '#8a6a4b' },
  { name: 'GPM', what: ['Lluvia y lluvias', 'extremas'], color: '#4aa3d6' },
  { name: 'Landsat y MODIS', what: ['Salud de la vegetación', 'y campos desnudos'], color: '#5b9a44' },
  { name: 'ECOSTRESS', what: ['Estrés por calor', 'en el cultivo'], color: '#e0842f' },
]

const MORE_DATA = ['NASA POWER: temperatura y riesgo de heladas', 'GRACE-FO: agua subterránea a largo plazo']

function Globe() {
  return (
    <svg viewBox="-30 -30 460 460" className="globe" role="img" aria-label="La Tierra vista desde el espacio, con un punto marcado en Guanajuato, México">
      <defs>
        <radialGradient id="ocean" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#4aa3d6" />
          <stop offset="0.55" stopColor="#1f6a97" />
          <stop offset="1" stopColor="#0a2b49" />
        </radialGradient>
        <radialGradient id="atmo" cx="50%" cy="50%" r="50%">
          <stop offset="0.86" stopColor="#8fd3ff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#8fd3ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="shade" cx="32%" cy="28%" r="85%">
          <stop offset="0.5" stopColor="#00122b" stopOpacity="0" />
          <stop offset="1" stopColor="#00122b" stopOpacity="0.6" />
        </radialGradient>
        <clipPath id="disc">
          <circle cx="200" cy="200" r="190" />
        </clipPath>
      </defs>

      <circle cx="200" cy="200" r="225" fill="url(#atmo)" />
      <circle cx="200" cy="200" r="190" fill="url(#ocean)" />

      <g clipPath="url(#disc)">
        <g fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="1">
          <ellipse cx="200" cy="200" rx="190" ry="60" />
          <ellipse cx="200" cy="200" rx="190" ry="125" />
          <ellipse cx="200" cy="200" rx="60" ry="190" />
          <ellipse cx="200" cy="200" rx="125" ry="190" />
          <line x1="10" y1="200" x2="390" y2="200" />
          <line x1="200" y1="10" x2="200" y2="390" />
        </g>
        {/* Norteamérica */}
        <path
          d="M60,95 C90,60 150,50 200,65 C245,75 275,95 265,125 C258,150 235,160 225,180 C218,195 225,205 232,215 C240,225 238,235 228,238 C215,240 205,230 195,222 C185,212 170,200 150,190 C120,180 95,160 80,135 C68,120 55,110 60,95 Z"
          fill="#5d9444"
        />
        {/* Sudamérica */}
        <path
          d="M232,245 C255,240 285,255 300,280 C312,305 295,335 275,360 C262,378 250,390 240,380 C232,350 225,320 215,295 C208,275 215,252 232,245 Z"
          fill="#5d9444"
        />
        {/* Groenlandia */}
        <path d="M285,50 C305,45 320,60 312,78 C300,90 285,80 280,65 Z" fill="#e8f1f5" />
        {/* zonas áridas y montañas */}
        <path d="M150,125 C175,118 200,128 205,148 C190,158 160,152 150,125 Z" fill="#c1b36a" fillOpacity="0.85" />
        <path d="M205,262 C215,275 220,305 232,340 C224,320 212,290 205,262 Z" fill="#8a7f43" />
        {/* nubes */}
        <g fill="#fff" fillOpacity="0.4">
          <ellipse cx="110" cy="165" rx="42" ry="9" />
          <ellipse cx="290" cy="170" rx="38" ry="8" />
          <ellipse cx="255" cy="305" rx="30" ry="7" />
          <ellipse cx="150" cy="75" rx="36" ry="7" />
        </g>
        <circle cx="200" cy="200" r="190" fill="url(#shade)" />
      </g>

      {/* órbita y satélite */}
      <g transform="rotate(-22 200 200)">
        <ellipse cx="200" cy="200" rx="238" ry="72" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="3 7" />
        <g transform="translate(373 246) rotate(22)">
          <rect x="-9" y="-5" width="18" height="10" rx="2" fill="#e6c66a" />
          <rect x="-26" y="-4" width="14" height="8" fill="#6fb3dc" />
          <rect x="12" y="-4" width="14" height="8" fill="#6fb3dc" />
        </g>
      </g>

      {/* punto de Guanajuato */}
      <circle className="pulse" cx="205" cy="213" r="9" fill="none" stroke="#ffd966" strokeWidth="2" />
      <circle cx="205" cy="213" r="4.5" fill="#ffd966" stroke="#fff" strokeWidth="1.5" />
      <line x1="205" y1="213" x2="150" y2="262" stroke="#fff" strokeWidth="1.2" strokeOpacity="0.8" />
      <text x="146" y="278" textAnchor="end" fill="#fff" fontSize="15" fontFamily="inherit" fontWeight="600">
        Guanajuato
      </text>
    </svg>
  )
}

function Landscape() {
  return (
    <svg className="landscape" viewBox="0 0 1440 170" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="rows" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <line x1="0" y1="2" x2="16" y2="2" stroke="#000" strokeOpacity="0.14" strokeWidth="4" />
        </pattern>
      </defs>
      <path d="M0,70 C240,20 480,100 760,60 C1040,20 1240,80 1440,50 L1440,170 L0,170Z" fill="#2f5d4a" />
      <path d="M0,102 C300,62 560,122 860,92 C1120,62 1300,112 1440,92 L1440,170 L0,170Z" fill="#4c7a3d" />
      <path d="M0,102 C300,62 560,122 860,92 C1120,62 1300,112 1440,92 L1440,170 L0,170Z" fill="url(#rows)" />
      <path d="M0,128 C260,102 520,142 800,122 C1080,102 1260,137 1440,122 L1440,170 L0,170Z" fill="#d9a92e" />
      <path d="M0,128 C260,102 520,142 800,122 C1080,102 1260,137 1440,122 L1440,170 L0,170Z" fill="url(#rows)" />
      <path className="ground" d="M0,152 C360,134 720,154 1440,142 L1440,170 L0,170Z" />
    </svg>
  )
}

function LayersIllustration() {
  return (
    <svg viewBox="0 0 410 330" className="layers" role="img" aria-label="Cuatro capas de datos satelitales apiladas sobre una parcela">
      {LAYERS.map((l, i) => {
        const y = 40 + i * 62
        return (
          <g key={l.name}>
            <polygon points={`20,${y + 30} 120,${y} 220,${y + 30} 120,${y + 60}`} fill={l.color} fillOpacity="0.88" stroke="#fff" strokeWidth="2" />
            <line x1="226" y1={y + 30} x2="250" y2={y + 30} stroke="#16312b" strokeOpacity="0.5" />
            <text x="256" y={y + 27} fontSize="16" fontWeight="700" fill="currentColor" fontFamily="inherit">
              {l.name}
            </text>
            {l.what.map((line, j) => (
              <text key={line} x="256" y={y + 45 + j * 14} fontSize="12" fill="currentColor" fillOpacity="0.75" fontFamily="inherit">
                {line}
              </text>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

function ParcelDemo() {
  const [active, setActive] = useState(ROTATIONS[0].id)
  const rotation = ROTATIONS.find((r) => r.id === active)
  const bandH = 70

  return (
    <div className="demo">
      <p className="demo-title">Así se ve una parcela en Toka</p>
      <div role="group" aria-label="Elige una rotación" className="demo-tabs">
        {ROTATIONS.map((r) => (
          <button key={r.id} type="button" aria-pressed={r.id === active} onClick={() => setActive(r.id)}>
            {r.name}
          </button>
        ))}
      </div>

      <svg
        viewBox="0 0 420 340"
        className="parcel"
        role="img"
        aria-label={`Parcela dividida en cuatro ciclos: ${rotation.cycles.map((c) => c.crop).join(', ')}`}
      >
        <defs>
          <clipPath id="parcel-clip">
            <polygon points="40,60 250,30 390,90 370,270 180,310 60,250" />
          </clipPath>
          <pattern id="bare" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="8" fill="#8A6A4B" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#6E5238" strokeWidth="3" />
          </pattern>
        </defs>
        <g clipPath="url(#parcel-clip)">
          {rotation.cycles.map((c, i) => (
            <rect key={i} className="band" x="0" y={30 + i * bandH} width="420" height={bandH + 1} fill={c.bare ? 'url(#bare)' : c.color} />
          ))}
        </g>
        <polygon points="40,60 250,30 390,90 370,270 180,310 60,250" fill="none" stroke="#16312B" strokeWidth="3" strokeLinejoin="round" />
        {[[40, 60], [250, 30], [390, 90], [370, 270], [180, 310], [60, 250]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="7" fill="#F3F5F0" stroke="#16312B" strokeWidth="3" />
        ))}
      </svg>

      <ol className="cycles" aria-label="Cultivo por ciclo">
        {rotation.cycles.map((c, i) => (
          <li key={i}>
            <span className="chip" style={{ background: c.color }} />
            Ciclo {i + 1}: {c.crop}
          </li>
        ))}
      </ol>

      <p className="demo-note">{rotation.note}</p>

      <dl className="scores">
        {METRICS.map(([key, label]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>
              <span className="bar">
                <span style={{ width: `${rotation.scores[key]}%` }} />
              </span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="fine">Ejemplo ilustrativo. Los resultados reales dependerán de tu parcela y tus datos.</p>
    </div>
  )
}


function Landing() {
  const {
    user,
    loading,
    busy,
    error,
    signIn,
    logout,
    clearError
  } = useAuth()

  const navigate = useNavigate()

  const [authOpen, setAuthOpen] = useState(false)
  const [checkingAccount, setCheckingAccount] = useState(false)
  const [backendError, setBackendError] = useState('')

  const firstName = user?.displayName?.split(' ')[0] || 'agricultor'

  const openAuth = () => {
    clearError()
    setBackendError('')
    setAuthOpen(true)
  }

  /**
   * Flujo:
   * 1. Autenticación con Google mediante Firebase.
   * 2. Obtención del ID Token.
   * 3. Validación de existencia de cuenta en el backend.
   * 4. Navegación según la respuesta.
   */
  const handleLogin = async () => {
    try {
      setBackendError('')
      setCheckingAccount(true)

      // 1. Iniciar sesión con Google
      const authenticated = await signIn()

      if (!authenticated) {
        return false
      }

      // 2. Obtener el usuario autenticado
      const currentUser = auth.currentUser
      console.log('Usuario autenticado:', currentUser)

      if (!currentUser) {
        throw new Error('No se encontró una sesión autenticada.')
      }
      console.log('Token de Firebase:', await currentUser.getIdToken())

      // 3. Obtener el token de Firebase
      const token = await currentUser.getIdToken()
      console.log('host del backend:', urlBackend)
      // 4. Consultar el backend
      const response = await fetch(
        `${urlBackend}/auth/account`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(
          `Error al validar la cuenta. Código HTTP: ${response.status}`
        )
      }

      const data = await response.json()

      // 5. Cerrar modal y navegar según la respuesta
      setAuthOpen(false)

      if (data.exists) {
        navigate('/app', { replace: true })
      } else {
        navigate('/registro', { replace: true })
      }

      return true

    } catch (err) {
      console.error('Error durante la autenticación:', err)

      setBackendError(
        err.message || 'No fue posible validar tu cuenta.'
      )

      return false

    } finally {
      setCheckingAccount(false)
    }
  }

  return (
    <>
      <div className="top">
        <header className="nav">
          <a href="#inicio" className="logo">
            Toka
          </a>

          <nav aria-label="Principal">
            <a href="#parcela">Tu parcela</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#datos">Datos</a>

            {!loading &&
              (user ? (
                <div className="user-chip">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="avatar"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  <span className="user-name">
                    {firstName}
                  </span>

                  <button
                    type="button"
                    className="btn-link"
                    onClick={logout}
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-small"
                  onClick={openAuth}
                >
                  Acceder
                </button>
              ))}
          </nav>
        </header>

        <section id="inicio" className="hero">
          <div className="hero-copy">
            <h1 style={{ color: 'white' }}>
              Marca tu parcela. Toka te dice qué sembrar después.
            </h1>

            <p className="lead">
              Toka combina observaciones de la Tierra de la NASA
              con lo que tú sabes de tu campo para comparar
              rotaciones de cultivo que cuidan el suelo y el agua.
            </p>

            <div className="hero-actions">
              {user ? (
                <button
                  type="button"
                  className="btn btn-wheat"
                  onClick={() => navigate('/app')}
                >
                  Ir a mis parcelas
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-wheat"
                  onClick={openAuth}
                >
                  Crear mi cuenta
                </button>
              )}

              <a href="#parcela" className="btn btn-ghost">
                Ver un ejemplo
              </a>
            </div>
          </div>

          <div className="hero-globe">
            <Globe />
          </div>
        </section>

        <Landscape />
      </div>

      <main>
        {user && (
          <section id="mis-parcelas" className="welcome">
            <h2>Hola, {firstName}</h2>

            <p>
              Tu cuenta está lista. Aquí aparecerán tus parcelas:
              marca la primera y Toka comparará rotaciones para ella.
            </p>
          </section>
        )}

        <section id="parcela" className="orbit">
          <div className="orbit-copy">
            <h2>De la órbita a tu parcela</h2>

            <p>
              Los satélites miran tu campo desde 700 kilómetros
              de altura, todos los días y desde hace décadas.
              Toka convierte esa historia de lluvia, calor y humedad
              en una comparación clara entre tu rotación actual
              y dos alternativas.
            </p>

            <p>
              Tú conoces tu tierra desde adentro. El satélite
              la ve desde arriba. Las mejores decisiones salen
              de juntar las dos miradas.
            </p>

            <p className="trust">
              Toka es una herramienta de apoyo. No reemplaza
              tu criterio ni el de tu técnico agrícola.
            </p>
          </div>

          <ParcelDemo />
        </section>

        <section id="como-funciona" className="steps">
          <h2>Cómo funciona</h2>

          <ol>
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <div className="step-icon">
                  {ICONS[s.icon]}
                </div>

                <h3>
                  {i + 1}. {s.title}
                </h3>

                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="datos" className="data">
          <div className="data-intro">
            <h2>Lo que el satélite ve en tu parcela</h2>

            <p>
              Cada capa de datos aporta una pista distinta
              sobre agua, calor y vegetación. Toka las alinea
              sobre tu parcela para que puedas compararlas.
            </p>

            <ul className="more-data">
              {MORE_DATA.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>

          <LayersIllustration />
        </section>

        {!user && (
          <section id="empezar" className="cta">
            <h2>Empieza con tu primera parcela</h2>

            <p>
              Entra con tu cuenta de Google. Es gratis
              y toma unos segundos.
            </p>

            <button
              type="button"
              className="google-btn"
              onClick={openAuth}
            >
              <GoogleLogo />
              Continuar con Google
            </button>
          </section>
        )}
      </main>

      <footer className="footer">
        <span className="logo">Toka</span>

        <p>
          Proyecto para el Desafío NASA Space Apps 2026:
          Cambio de campo.
        </p>
      </footer>

      <AuthModal
        open={authOpen && !user}
        onClose={() => setAuthOpen(false)}
        onSignIn={handleLogin}
        busy={busy || checkingAccount}
        error={backendError || error}
      />
    </>
  )
}



export default Landing