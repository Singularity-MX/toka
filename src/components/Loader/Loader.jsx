import React, { useState } from "react";
import "./Loader.css";

// Id único por instancia (el <mask> del SVG necesita un id propio si hay varios loaders)
let loaderCount = 0;

// Silueta exacta del hexágono del logo
const HEX =
  "M21.5689 2.23002C22.1518 1.92341 22.8482 1.92341 23.4311 2.23002L40.9167 11.428C41.574 11.7737 41.9856 12.4553 41.9856 13.198V31.2825C41.9856 32.0252 41.574 32.7067 40.9167 33.0525L23.4311 42.2505C22.8482 42.5571 22.1518 42.5571 21.5689 42.2505L4.08333 33.0525C3.42601 32.7067 3.01443 32.0252 3.01443 31.2825V13.198C3.01443 12.4553 3.42601 11.7737 4.08333 11.428L21.5689 2.23002Z";

/**
 * Loader con el logo de Toka: el hexágono se dibuja solo y después brotan
 * las dos hojas, una tras otra, en bucle. El logo va inline (sin imports).
 *
 * @param {number}  size        Tamaño del logo en px (default 120)
 * @param {string}  label       Texto bajo el logo ("" para ocultarlo)
 * @param {boolean} fullScreen  Cubre toda la pantalla
 * @param {boolean} overlay     Cubre su contenedor padre (que debe tener position: relative)
 * @param {string}  className   Clase extra opcional
 *
 * if (loading) return <Loader fullScreen />;
 * <Loader size={72} label="" />
 * {loading && <Loader overlay />}
 */
export default function Loader({
  size = 120,
  label = "Cargando",
  fullScreen = false,
  overlay = false,
  className = "",
}) {
  const [uid] = useState(() => `toka-loader-${++loaderCount}`);
  const mode = fullScreen ? "loader--fullscreen" : overlay ? "loader--overlay" : "";

  return (
    <div
      className={`loader ${mode} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={label || "Cargando"}
    >
      <div className="loader__stage" style={{ width: size, height: size }}>
        <span className="loader__halo" />

        <svg
          className="loader__logo"
          viewBox="0 0 45 45"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            {/* Deja visible solo la mitad exterior del trazo, igual que en tu logo */}
            <mask id={uid} maskUnits="userSpaceOnUse" x="0" y="0" width="45" height="45">
              <rect width="45" height="45" fill="#fff" />
              <path d={HEX} fill="#000" />
            </mask>
          </defs>

          <g className="loader__group">
            <path className="loader__hex-fill" d={HEX} fill="#F5F5EE" />

            <path
              className="loader__hex-stroke"
              d={HEX}
              pathLength="100"
              fill="none"
              stroke="#16312B"
              strokeWidth="4"
              strokeLinejoin="round"
              mask={`url(#${uid})`}
            />

            {/* Hoja clara (izquierda) */}
            <g className="loader__leaf loader__leaf--left">
              <path
                d="M22.8475 31.9695C17.6831 32.0601 7.97874 29.6061 10.4765 19.0655C15.1266 18.8827 24.111 21.2074 22.8475 31.9695Z"
                fill="#CFE3C4"
              />
              <path
                d="M22.8475 31.9695L22.8486 32.4679L23.2939 32.4601L23.3456 32.0197L22.8475 31.9695ZM10.4765 19.0655L10.4644 18.5674L10.0775 18.5827L9.98849 18.9583L10.4765 19.0655ZM22.8475 31.9695L22.8463 31.471C20.3242 31.5153 16.724 30.9334 14.0805 29.0943C12.7677 28.181 11.6986 26.9638 11.0999 25.3615C10.5012 23.7588 10.3583 21.7314 10.9646 19.1728L10.4765 19.0655L9.98849 18.9583C9.34591 21.67 9.47937 23.902 10.159 25.7212C10.8388 27.5406 12.0503 28.9076 13.4969 29.914C16.3722 31.9144 20.2063 32.5142 22.8486 32.4679L22.8475 31.9695ZM10.4765 19.0655L10.4887 19.5637C12.74 19.4751 16.0289 19.9983 18.5832 21.8197C21.0994 23.614 22.9613 26.7071 22.3494 31.9192L22.8475 31.9695L23.3456 32.0197C23.9972 26.4697 21.9987 23.0194 19.1761 21.0066C16.3915 19.0209 12.8632 18.4731 10.4644 18.5674L10.4765 19.0655Z"
                fill="#16312B"
              />
            </g>

            {/* Hoja verde (derecha) */}
            <g className="loader__leaf loader__leaf--right">
              <path
                d="M23.3674 27.7524C22.3209 22.9191 23.0535 13.3524 34.3558 13.7524C35.4023 18.0857 34.6697 26.9524 23.3674 27.7524Z"
                fill="#5B7F3A"
                stroke="#16312B"
              />
            </g>
          </g>
        </svg>

        <span className="loader__shadow" />
      </div>

      {label && (
        <p className="loader__label">
          {label}
          <span className="loader__dots" aria-hidden="true">
            <i /><i /><i />
          </span>
        </p>
      )}
    </div>
  );
}