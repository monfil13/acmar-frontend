import { useEffect, useState } from 'react'
import client from '../api/client'
import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/useAuth'

export default function InventarioPage() {
  const { user } = useAuth()

  const [inventario, setInventario] = useState([])
  const [ubicaciones, setUbicaciones] = useState([])
  const [error, setError] = useState('')

  const [filters, setFilters] = useState({
    q: '',
    estatus: '',
    ubicacion: '',
  })

  const isAdmin =
    user?.rol === 'admin' ||
    user?.rol === 'super_admin' ||
    user?.rol === 'control'

  // 🔥 TRAER UBICACIONES
  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const res = await client.get('/inventario/ubicaciones')
        setUbicaciones(res.data || [])
      } catch (err) {
        console.error(err)
      }
    }

    fetchUbicaciones()
  }, [])

  // 🔥 TRAER INVENTARIO SIN PAGINACIÓN
  useEffect(() => {
    const fetchInventario = async () => {
      setError('')

      try {
        const query = new URLSearchParams({
          ...(filters.q && { q: filters.q }),
          ...(filters.estatus && { estatus: filters.estatus }),
          ...(filters.ubicacion && { ubicacion: filters.ubicacion }),
        }).toString()

        const res = await client.get(`/inventario?${query}`)
        setInventario(res.data.inventario || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar inventario')
      }
    }

    fetchInventario()
  }, [filters])

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Inventario</h1>

      {/* 🔥 FILTROS */}
      <div className="bg-white p-4 rounded-xl border mb-4 flex gap-3 flex-wrap">
        
        {/* BUSCADOR */}
        <input
          placeholder="Buscar por material o descripción..."
          value={filters.q}
          onChange={(e) =>
            setFilters({ ...filters, q: e.target.value })
          }
          className="border px-3 py-2 rounded w-60"
        />

        {/* ESTATUS */}
        <select
          value={filters.estatus}
          onChange={(e) =>
            setFilters({ ...filters, estatus: e.target.value })
          }
          className="border px-3 py-2 rounded"
        >
          <option value="">Todos</option>
          <option value="disponible">Disponible</option>
          <option value="vendido">Vendido</option>
        </select>

        {/* UBICACIONES */}
        {isAdmin && (
          <select
            value={filters.ubicacion}
            onChange={(e) =>
              setFilters({ ...filters, ubicacion: e.target.value })
            }
            className="border px-3 py-2 rounded"
          >
            <option value="">Todas las ubicaciones</option>
            {ubicaciones.map((u, i) => (
              <option key={i} value={u}>
                {u}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 🔥 TABLA */}
      <div className="bg-white rounded-xl border overflow-auto">
        {error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-3 py-2">Material</th>
                <th className="px-3 py-2">Descripción</th>
                <th className="px-3 py-2">Color</th>
                <th className="px-3 py-2">IMEI</th>
                <th className="px-3 py-2">IMEI 2</th>
                <th className="px-3 py-2">ICCID</th>
                <th className="px-3 py-2">Público</th>
                <th className="px-3 py-2">Mayoreo</th>
                <th className="px-3 py-2">Estatus</th>
                <th className="px-3 py-2">Ubicación</th>
                <th className="px-3 py-2">Fecha venta</th>
              </tr>
            </thead>

            <tbody>
              {inventario.map((item) => (
                <tr key={item.material} className="border-t">
                  <td className="px-3 py-2 font-medium">{item.material}</td>
                  <td className="px-3 py-2">{item.descripcion}</td>
                  <td className="px-3 py-2">{item.color}</td>
                  <td className="px-3 py-2">{item.imei || '-'}</td>
                  <td className="px-3 py-2">{item.imei2 || '-'}</td>
                  <td className="px-3 py-2">{item.iccid || '-'}</td>
                  <td className="px-3 py-2">${item.precio_publico || 0}</td>
                  <td className="px-3 py-2">${item.precio_mayoreo || 0}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.estatus === 'vendido'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {item.estatus || 'disponible'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {item.ubicacion_actual || '-'}
                  </td>
                  <td className="px-3 py-2">
                    {item.fecha_venta
                      ? item.fecha_venta.slice(0, 10)
                      : '-'}
                  </td>
                </tr>
              ))}

              {inventario.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-6 text-gray-500">
                    No hay registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  )
}