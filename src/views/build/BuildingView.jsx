
import React from "react";
import "./BuildingView.css";

const BuildingView = () => {
  return (
    <main className="toka-building">

      <header className="toka-header">
        <a href="/" className="toka-logo">
          <span className="toka-logo-icon">
            <svg viewBox="0 0 48 48" fill="none">
              <path
                d="M24 4L43 15V33L24 44L5 33V15L24 4Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M24 35V22C24 13 32 11 37 12C37 22 32 28 24 28"
                fill="#5B7F3A"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M24 31C24 23 17 19 11 20C11 29 16 34 24 35"
                fill="#CFE3C4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <span className="toka-logo-text">
            <strong>Toka</strong>
            <small>Cultiva decisiones inteligentes</small>
          </span>
        </a>

        <div className="toka-status">
          <span className="toka-status-dot" />
          Plataforma en desarrollo
        </div>
      </header>

      <section className="toka-hero">

        <div className="toka-hero-content">

          <span className="toka-eyebrow">
            GESTIÓN INTELIGENTE DE CULTIVOS
          </span>

          <h1>
            Estamos preparando
            <span> algo que hará crecer tus ideas.</span>
          </h1>

          <p className="toka-description">
            Estamos construyendo una plataforma para ayudarte
            a gestionar tus parcelas, monitorear tus cultivos
            y tomar mejores decisiones agrícolas mediante
            información ambiental y tecnología satelital.
          </p>

          <div className="toka-message">
            <span className="toka-message-icon">✳</span>
            <div>
              <strong>La agricultura también evoluciona.</strong>
              <p>Muy pronto podrás cultivar con más información.</p>
            </div>
          </div>

          <div className="toka-features">
            <div>
              <span>01</span>
              <p>Gestión de parcelas</p>
            </div>
            <div>
              <span>02</span>
              <p>Monitoreo de cultivos</p>
            </div>
            <div>
              <span>03</span>
              <p>Datos satelitales</p>
            </div>
          </div>

        </div>

        <div className="toka-illustration">

          <div className="toka-illustration-label">
            <span className="label-dot" />
            AGRICULTURA INTELIGENTE
          </div>

          <svg
            className="toka-farm-svg"
            viewBox="0 0 620 480"
            role="img"
            aria-label="Ilustración de una parcela agrícola con cultivos, surcos y paisaje rural"
          >
            <defs>
              <linearGradient id="farmSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E9F0D9" />
                <stop offset="100%" stopColor="#F5F3E8" />
              </linearGradient>

              <linearGradient id="farmSoil" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A78A62" />
                <stop offset="100%" stopColor="#765B40" />
              </linearGradient>

              <clipPath id="farmClip">
                <path d="M40 270 Q300 190 580 270 L600 410 Q310 500 20 410Z" />
              </clipPath>
            </defs>

            {/* Cielo */}
            <rect width="620" height="480" fill="url(#farmSky)" />

            {/* Sol */}
            <circle cx="480" cy="85" r="39" fill="#E6C66A" opacity=".8" />
            <circle cx="480" cy="85" r="52" fill="#E6C66A" opacity=".12" />

            {/* Nubes */}
            <g fill="#FFFFFF" opacity=".85">
              <path d="M65 105 Q65 80 91 80 Q105 45 140 70 Q165 65 174 91 Q195 95 192 115 H65Z" />
              <path d="M355 135 Q355 115 378 115 Q390 85 417 105 Q441 101 451 127 H355Z" />
            </g>

            {/* Montañas */}
            <path
              d="M0 255 L110 170 L195 240 L300 145 L415 240 L520 170 L620 250 V310 H0Z"
              fill="#A7BB8C"
              opacity=".7"
            />

            {/* Colinas */}
            <path
              d="M0 255 Q140 205 280 250 Q440 190 620 250 V330 H0Z"
              fill="#6F9660"
            />

            <path
              d="M0 280 Q170 235 310 280 Q470 235 620 280 V340 H0Z"
              fill="#91AC72"
            />

            {/* Suelo */}
            <path
              d="M40 270 Q300 190 580 270 L600 410 Q310 500 20 410Z"
              fill="url(#farmSoil)"
            />

            {/* Surcos */}
            <g clipPath="url(#farmClip)" fill="none" stroke="#5D4935" strokeWidth="12" opacity=".55">
              <path d="M40 300 Q170 270 310 290 T620 300" />
              <path d="M20 345 Q170 310 310 340 T620 340" />
              <path d="M10 395 Q170 355 310 390 T620 390" />
              <path d="M80 450 Q260 400 430 445" />
            </g>

            {/* Plantas */}
            {[
              [105, 300], [190, 315], [280, 300],
              [375, 315], [470, 300], [550, 320],
              [145, 380], [250, 375], [360, 390], [475, 380]
            ].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y}) scale(${0.75 + (i % 3) * 0.15})`}>
                <path d="M0 0 V-38" stroke="#365E37" strokeWidth="4" />
                <path
                  d="M0 -24 Q-25 -55 -30 -30 Q-22 -12 0 -18"
                  fill="#5B7F3A"
                  stroke="#365E37"
                  strokeWidth="1.5"
                />
                <path
                  d="M0 -32 Q24 -65 30 -39 Q23 -20 0 -23"
                  fill="#85A95A"
                  stroke="#365E37"
                  strokeWidth="1.5"
                />
                <path
                  d="M0 -18 Q-10 -37 -15 -22"
                  stroke="#CFE3C4"
                  strokeWidth="2"
                  fill="none"
                />
              </g>
            ))}

            {/* Árboles al fondo */}
            <g fill="#416E42">
              <circle cx="35" cy="250" r="28" />
              <circle cx="55" cy="235" r="25" />
              <circle cx="585" cy="250" r="35" />
              <circle cx="565" cy="232" r="26" />
            </g>

            {/* Etiqueta de parcela */}
            <g transform="translate(365 185)">
              <rect width="145" height="45" rx="10" fill="#F8F7EE" stroke="#16312B" strokeWidth="1.5" />
              <circle cx="18" cy="22" r="5" fill="#5B7F3A" />
              <text x="32" y="27" fontSize="12" fill="#16312B" fontWeight="600">
                Parcela agrícola
              </text>
            </g>

            {/* Borde decorativo */}
            <path
              d="M40 270 Q300 190 580 270"
              stroke="#16312B"
              strokeWidth="2"
              fill="none"
              opacity=".35"
            />
          </svg>

          <div className="toka-data-card">
            <div className="data-card-icon">⌁</div>
            <div>
              <strong>Del campo al dato.</strong>
              <span>Información para mejores decisiones.</span>
            </div>
          </div>

        </div>
      </section>

      <section className="toka-bottom">

        <div className="toka-bottom-text">
          <span className="toka-bottom-icon">✳</span>
          <div>
            <strong>Estamos trabajando en ello.</strong>
            <p>Gracias por acompañarnos en este crecimiento.</p>
          </div>
        </div>

        <a
          className="toka-contact"
          href="mailto:coordinacion@singularitymx.org"
        >
          Contactar al equipo <span>↗</span>
        </a>

      </section>

      <footer className="toka-footer">
        <span>TOKA</span>
        <span>TECNOLOGÍA · AGRICULTURA · CIENCIA</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>

    </main>
  );
};

export default BuildingView;
