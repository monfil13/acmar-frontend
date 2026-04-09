import { useEffect, useState } from 'react'
import client from '../api/client'
import { useAuth } from '../context/useAuth'
import AppLayout from '../layouts/AppLayout'

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await client.get('/dashboard/resumen')
        setData(res.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <AppLayout>
        <div>Cargando dashboard...</div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="text-red-600">{error}</div>
      </AppLayout>
    )
  }

  const resumen = data?.resumen || {}

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Bienvenido, {user?.email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Inventario total" value={resumen.inventario_total} />
        <Card title="Disponibles" value={resumen.inventario_disponible} />
        <Card title="Vendidos" value={resumen.inventario_vendido} />
        <Card title="Ventas hoy" value={resumen.ventas_hoy} />
        <Card title="Remisiones hoy" value={resumen.remisiones_hoy} />
        <Card title="Equipos vendidos hoy" value={resumen.equipos_vendidos_hoy} />
        <Card title="Total mayoreo hoy" value={`$${resumen.total_mayoreo_hoy || 0}`} />
        <Card title="Total público hoy" value={`$${resumen.total_publico_hoy || 0}`} />
      </div>
    </AppLayout>
  )
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className="text-3xl font-bold text-slate-800 mt-2">{value ?? 0}</h2>
    </div>
  )
}