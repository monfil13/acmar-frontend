import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import InventarioPage from './pages/InventarioPage'
import NotasPage from './pages/NotasPage'

// NUEVAS PÁGINAS (las vamos a crear)
import VentasPage from './pages/VentasPage'
import CortePage from './pages/CortePage'
import CargaExcelPage from './pages/CargaExcelPage'

// LEGACY (puedes dejarlo)
import ReportesPage from './pages/ReportesPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/inventario" element={<ProtectedRoute><InventarioPage /></ProtectedRoute>} />
          <Route path="/notas" element={<ProtectedRoute><NotasPage /></ProtectedRoute>} />

          {/* NUEVO: pantallas separadas */}
          <Route path="/ventas" element={<ProtectedRoute><VentasPage /></ProtectedRoute>} />
          <Route path="/corte" element={<ProtectedRoute><CortePage /></ProtectedRoute>} />
          <Route path="/carga-excel" element={<ProtectedRoute><CargaExcelPage /></ProtectedRoute>} />

          {/* LEGACY: si alguien entra, no se rompe */}
          <Route path="/reportes" element={<ProtectedRoute><ReportesPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}