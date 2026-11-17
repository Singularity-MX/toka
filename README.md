# Toka

App web para comparar rotaciones de cultivo con datos de observación de la Tierra de la NASA.
Proyecto para **NASA Space Apps Challenge 2026** (reto *Field Shift: Adapting Farms with NASA Data*),
parte de [Singularity](https://singularitymx.org).

**Stack:** React 19 · Vite · Ant Design · React Router · Leaflet · Firebase Auth.
El backend de parcelas/recomendaciones vive en un servicio aparte (`VITE_URL_BACKEND`).

## Empezar

```bash
npm install
cp .env.example .env   # y llena VITE_URL_BACKEND
npm run dev
```

| Script            | Qué hace                  |
| ----------------- | ------------------------- |
| `npm run dev`     | Servidor de desarrollo    |
| `npm run build`   | Build de producción (`dist/`) |
| `npm run preview` | Sirve el build local      |
| `npm run lint`    | ESLint                    |

## Estructura

```
src/
├── main.jsx              # Punto de entrada: providers + router
├── app/
│   └── AppRouter.jsx     # Rutas (páginas con lazy loading)
├── pages/                # Una carpeta por pantalla (JSX + CSS juntos)
│   ├── Landing/  Onboarding/  Home/  Profile/  Building/
│   └── Parcels/          # ParcelsList, AddParcel, ParcelDetail
├── components/           # UI compartida: Navbar, Sidebar, Loader, icons
├── auth/                 # AuthProvider/useAuth + AuthModal
├── hooks/                # useLocalStorage, useWeatherLocation, useIsMobile
├── services/             # firebase.js
├── config/               # Variables de entorno (backend.config.js)
└── utils/                # geo.js, storage.js
```

El alias `@` apunta a `src/` (ej. `import { auth } from '@/services/firebase'`).

### Rutas

| Ruta            | Página        |
| --------------- | ------------- |
| `/`             | Landing + login con Google |
| `/config`       | Onboarding de usuario nuevo |
| `/home`         | Panel principal |
| `/parcels`      | Mis parcelas |
| `/parcels/add`  | Dibujar parcela nueva |
| `/parcels/:id`  | Detalle de parcela |
| `/profile`      | Mi perfil |

## Despliegue

Push a `main` → GitHub Actions (`.github/workflows/deploy.yml`) compila y sube `dist/` por rsync a Hostinger.
Configura en GitHub → Settings → Secrets and variables:

- Secret: `SSH_PRIVATE_KEY`
- Variables: `HOSTINGER_HOST`, `HOSTINGER_PORT`, `HOSTINGER_USER`, `VITE_URL_BACKEND`

`public/.htaccess` se copia a `dist/` y hace el fallback de SPA para React Router.
