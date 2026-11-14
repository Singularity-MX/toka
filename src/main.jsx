import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import './index.css'
import 'antd/dist/reset.css';

import { AuthProvider } from './auth/useAuth.jsx'
//-------------------- Landing ------------------------------
import Landing from './views/Landing/Landing.jsx'


//-------------------- Views ------------------------------
import Home from './views/Home/Home.jsx'
import MyPercels from './views/MisParcelas/MisParcelas.jsx'


import MyProfile from './views/MiPerfil/MyProfile.jsx'


//-------------------- Layouts ------------------------------


import Dashboard from './views/Landing/Example.jsx'

import Test from './views/test/Test.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
<Route path="/test" element={<Test />}/>
        <Route path="/home" element={<Home />} />
        <Route path="/percels" element={<MyPercels />} />
        <Route path="/profile" element={<MyProfile />} />

        {/* Redirigir rutas inexistentes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)