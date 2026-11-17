import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import './Landing.css'

import { useAuth } from '@/auth/useAuth'
import { auth } from '@/services/firebase'

import AuthModal, { GoogleLogo } from '@/auth/AuthModal'
import { urlBackend } from '@/config/backend.config'
import { em, header, nav } from 'framer-motion/client'

import { useLocalStorage } from '@/hooks/useLocalStorage'

const ROTATIONS = [
  {
    id: 'actual',
    name: 'Your current rotation',
    note: 'Corn and fallow: the soil sits bare for months and erodes.',
    cycles: [
      { crop: 'Corn', color: '#D9A92E' },
      { crop: 'Fallow', color: '#8A6A4B', bare: true },
      { crop: 'Corn', color: '#D9A92E' },
      { crop: 'Fallow', color: '#8A6A4B', bare: true },
    ],
    scores: { agua: 20, suelo: 25, ingreso: 60 },
  },
  {
    id: 'frijol',
    name: 'Corn and beans',
    note: 'Beans fix nitrogen and reduce the need for fertilizer.',
    cycles: [
      { crop: 'Corn', color: '#D9A92E' },
      { crop: 'Beans', color: '#5B7F3A' },
      { crop: 'Corn', color: '#D9A92E' },
      { crop: 'Beans', color: '#5B7F3A' },
    ],
    scores: { agua: 45, suelo: 60, ingreso: 65 },
  },
  {
    id: 'cobertura',
    name: 'Sorghum, cover crop and chickpea',
    note: 'Drought-tolerant crops and a cover crop that protects the soil in winter.',
    cycles: [
      { crop: 'Sorghum', color: '#A4452F' },
      { crop: 'Oats with vetch', color: '#7DB08A' },
      { crop: 'Corn', color: '#D9A92E' },
      { crop: 'Chickpea', color: '#C9B27A' },
    ],
    scores: { agua: 70, suelo: 80, ingreso: 55 },
  },
]

const METRICS = [
  ['agua', 'Water savings'],
  ['suelo', 'Soil health'],
  ['ingreso', 'Income'],
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
    title: 'Mark your plot',
    text: 'Draw the real outline of your land on the map. You can save several plots in your account.',
  },
  {
    icon: 'sliders',
    title: 'Tell us what matters to you',
    text: 'Saving water, improving the soil, earning more or using less fertilizer. Also your equipment and your markets.',
  },
  {
    icon: 'compare',
    title: 'Compare three rotations',
    text: 'Toka shows you your current rotation and two alternatives, with the evidence, the benefits and what we still don’t know.',
  },
]

const LAYERS = [
  { name: 'SMAP', what: ['Soil moisture'], color: '#8a6a4b' },
  { name: 'GPM', what: ['Rainfall and extreme', 'rain events'], color: '#4aa3d6' },
  { name: 'Landsat and MODIS', what: ['Vegetation health', 'and bare fields'], color: '#5b9a44' },
  { name: 'ECOSTRESS', what: ['Heat stress', 'on the crop'], color: '#e0842f' },
]

const MORE_DATA = ['NASA POWER: temperature and frost risk', 'GRACE-FO: long-term groundwater']

function Globe() {
  return (
    <svg viewBox="-30 -30 460 460" className="globe" role="img" aria-label="Earth seen from space, with a point marked in Guanajuato, Mexico">
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
        {/* North America */}
        <path
          d="M60,95 C90,60 150,50 200,65 C245,75 275,95 265,125 C258,150 235,160 225,180 C218,195 225,205 232,215 C240,225 238,235 228,238 C215,240 205,230 195,222 C185,212 170,200 150,190 C120,180 95,160 80,135 C68,120 55,110 60,95 Z"
          fill="#5d9444"
        />
        {/* South America */}
        <path
          d="M232,245 C255,240 285,255 300,280 C312,305 295,335 275,360 C262,378 250,390 240,380 C232,350 225,320 215,295 C208,275 215,252 232,245 Z"
          fill="#5d9444"
        />
        {/* Greenland */}
        <path d="M285,50 C305,45 320,60 312,78 C300,90 285,80 280,65 Z" fill="#e8f1f5" />
        {/* arid areas and mountains */}
        <path d="M150,125 C175,118 200,128 205,148 C190,158 160,152 150,125 Z" fill="#c1b36a" fillOpacity="0.85" />
        <path d="M205,262 C215,275 220,305 232,340 C224,320 212,290 205,262 Z" fill="#8a7f43" />
        {/* clouds */}
        <g fill="#fff" fillOpacity="0.4">
          <ellipse cx="110" cy="165" rx="42" ry="9" />
          <ellipse cx="290" cy="170" rx="38" ry="8" />
          <ellipse cx="255" cy="305" rx="30" ry="7" />
          <ellipse cx="150" cy="75" rx="36" ry="7" />
        </g>
        <circle cx="200" cy="200" r="190" fill="url(#shade)" />
      </g>

      {/* orbit and satellite */}
      <g transform="rotate(-22 200 200)">
        <ellipse cx="200" cy="200" rx="238" ry="72" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="3 7" />
        <g transform="translate(373 246) rotate(22)">
          <rect x="-9" y="-5" width="18" height="10" rx="2" fill="#e6c66a" />
          <rect x="-26" y="-4" width="14" height="8" fill="#6fb3dc" />
          <rect x="12" y="-4" width="14" height="8" fill="#6fb3dc" />
        </g>
      </g>

      {/* Guanajuato point */}
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
    <svg viewBox="0 0 410 330" className="layers" role="img" aria-label="Four layers of satellite data stacked over a plot">
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
      <p className="demo-title">This is how a plot looks in Toka</p>
      <div role="group" aria-label="Choose a rotation" className="demo-tabs">
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
        aria-label={`Plot divided into four cycles: ${rotation.cycles.map((c) => c.crop).join(', ')}`}
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

      <ol className="cycles" aria-label="Crop per cycle">
        {rotation.cycles.map((c, i) => (
          <li key={i}>
            <span className="chip" style={{ background: c.color }} />
            Cycle {i + 1}: {c.crop}
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
      <p className="fine">Illustrative example. Actual results will depend on your plot and your data.</p>
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

  const firstName = user?.displayName?.split(' ')[0] || 'farmer'

  const [User, setUser, removeUser] = useLocalStorage('user', null);

  const openAuth = () => {
    clearError()
    setBackendError('')
    setAuthOpen(true)
  }

  /**
   * Flow:
   * 1. Google authentication through Firebase.
   * 2. Get the ID Token.
   * 3. Check that the account exists in the backend.
   * 4. Navigate based on the response.
   */
const handleLogin = async () => {
  try {
    setBackendError('')
    setCheckingAccount(true)

    // 1. Google popup
    const authenticated = await signIn()
    if (!authenticated) return false

    // 2. Get user + ID Token
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error('No authenticated session was found.')

    const token = await currentUser.getIdToken()
    console.log('Authenticated user:', currentUser.email)

    // 3. Call the backend — ONLY the token, no email in the body
    const response = await fetch(`${urlBackend}/auth/session`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    console.log('Backend response status:', urlBackend+'/auth/session', response.status, response.statusText)
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      throw new Error(
        errorBody.message || `Error validating the account (HTTP ${response.status})`
      )
    }

    const { user, isNewUser } = await response.json()
    const userData = {
      uid: user.uid,
      email: user.email,
      nombre: user.nombre || currentUser.displayName || '',
      photoURL: currentUser.photoURL || '',
    };
    console.log('User data from the backend:', userData);
    setUser(userData);

    if (isNewUser) {
      navigate('/config')  
    } else {
      navigate('/home')  
    }

    setAuthOpen(false)
    return { user, isNewUser }
  } catch (err) {
    console.error('Error during authentication:', err)
    setBackendError(err.message || 'We could not validate your account.')
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

          <nav aria-label="Main">
            <a href="#parcela">Your plot</a>
            <a href="#como-funciona">How it works</a>
            <a href="#datos">Data</a>

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
                    Log out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-small"
                  onClick={openAuth}
                >
                  Sign in
                </button>
              ))}
          </nav>
        </header>

        <section id="inicio" className="hero">
          <div className="hero-copy">
            <h1 style={{ color: '#ffffff' }}>
              Mark your plot. Toka tells you what to plant next.
            </h1>

            <p className="lead">
              Toka combines NASA Earth observations
              with what you know about your field to compare
              crop rotations that protect the soil and water.
            </p>

            <div className="hero-actions">
              {user ? (
                <button
                  type="button"
                  className="btn btn-wheat"
                  onClick={() => navigate('/home')}
                >
                  Go to my plots
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-wheat"
                  onClick={openAuth}
                >
                  Create my account
                </button>
              )}

              <a href="#parcela" className="btn btn-ghost">
                See an example
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
            <h2>Hello, {firstName}</h2>

            <p>
              Your account is ready. Your plots will appear here:
              mark your first one and Toka will compare rotations for it.
            </p>
          </section>
        )}

        <section id="parcela" className="orbit">
          <div className="orbit-copy">
            <h2>From orbit to your plot</h2>

            <p>
              Satellites watch your field from 700 kilometers
              up, every day and for decades.
              Toka turns that history of rain, heat and moisture
              into a clear comparison between your current rotation
              and two alternatives.
            </p>

            <p>
              You know your land from the inside. The satellite
              sees it from above. The best decisions come
              from combining both views.
            </p>

            <p className="trust">
              Toka is a support tool. It does not replace
              your judgment or that of your agricultural technician.
            </p>
          </div>

          <ParcelDemo />
        </section>

        <section id="como-funciona" className="steps">
          <h2>How it works</h2>

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
            <h2>What the satellite sees on your plot</h2>

            <p>
              Each data layer provides a different clue
              about water, heat and vegetation. Toka aligns them
              over your plot so you can compare them.
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
            <h2>Start with your first plot</h2>

            <p>
              Sign in with your Google account. It’s free
              and takes a few seconds.
            </p>

            <button
              type="button"
              className="google-btn"
              onClick={openAuth}
            >
              <GoogleLogo />
              Continue with Google
            </button>
          </section>
        )}
      </main>

      <footer className="footer">
        <span className="logo">Toka</span>

        <p>
          Project for the NASA Space Apps 2026 Challenge:
          Field Change.
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