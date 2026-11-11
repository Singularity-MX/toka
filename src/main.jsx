import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import './index.css'
import App from './App.jsx'

import Landing from './views/Landing/Landing.jsx'
//-------------------- Menu ------------------------------
import Home from './views/Home/Home.jsx'
import LayoutHome from './views/Home/Layout.jsx'

import AppLayout from './views/Home/AppLayout.jsx'

import BuildingView from './views/build/BuildingView.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BuildingView />} />

        {/* Redirigir rutas inexistentes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)