import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Loader from '@/components/Loader/Loader'
import Landing from '@/pages/Landing/Landing'

// El resto de páginas se cargan bajo demanda (el bundle inicial era de ~1.3 MB).
const Onboarding = lazy(() => import('@/pages/Onboarding/Onboarding'))
const Home = lazy(() => import('@/pages/Home/Home'))
const ParcelsList = lazy(() => import('@/pages/Parcels/ParcelsList'))
const AddParcel = lazy(() => import('@/pages/Parcels/AddParcel'))
const ParcelDetail = lazy(() => import('@/pages/Parcels/ParcelDetail'))
const MyProfile = lazy(() => import('@/pages/Profile/MyProfile'))

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader fullScreen />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/config" element={<Onboarding />} />

          <Route path="/home" element={<Home />} />
          <Route path="/parcels" element={<ParcelsList />} />
          <Route path="/parcels/add" element={<AddParcel />} />
          <Route path="/parcels/:id" element={<ParcelDetail />} />
          <Route path="/profile" element={<MyProfile />} />

          {/* Redirigir rutas inexistentes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
