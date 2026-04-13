import { useEffect, useState } from 'react'
import client from '../api/client'
import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/useAuth'

export default function InventarioPage() {
  const { user } = useAuth()

  const [inventario, setInventario] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  const [meta, setMeta] = useState({
    total: 0,
    total_pages: 0,
    limit: 5,
  })

  // 🔥 FILTROS
  const [filters, setFilters] = useState({
    q: '',
    estatus: '',
    ubicacion: '',
  })

  const isAdmin =
    user?.rol === 'admin' ||
    user?.rol === 'super_admin' ||
    user?.rol === 'control'

  useEffect(() => {
    const fetchInventario = async () => {
      setLoading(true)
      setError('')

      try {
        const query = new URLSearchParams({
          page,
          limit: meta.limit,
          ...(filters.q && { q: filters.q }),
          ...(filters.estatus && { estatus: filters.estatus }),
          ...(filters.ubicacion && isAdmin && { ubicacion: filters.ubicacion }),
        }).toString()

        const res = await client.get(`/inventario?${query}`)

        setInventario(res.data.inventario || [])
        setMeta((m) => ({
          ...m,
          total: res.data.total || 0,
          total_pages: res.data.total_pages || 0,
          limit: res.data.limit || m.limit,
        }))
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar inventario')
      } finally {
        setLoading(false)
      }
    }

    fetchInventario()
  }, [page, meta.limit, filters])

  return (
    <AppLayout>
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
        <p className="text-slate-500">Consulta de equipos con filtros</p>
      </div>

      {/* 🔥 FILTROS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-4 flex flex-wrap gap-3">
        {/* BUSCADOR */}
        <input
          type="text"
          placeholder="Buscar por material, descripción..."
          value={filters.q}
          onChange={(e) => {
            setPage(1)
            setFilters({ ...filters, q: e.target.value })
          }}
          className="border rounded-xl px-3 py-2 text-sm w-64"
        />

        {/* ESTATUS */}
        <select
          value={filters.estatus}
          onChange={(e) => {
            setPage(1)
            setFilters({ ...filters, estatus: e.target.value })
          }}
          className="border rounded-xl px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          <option value="disponible">Disponible</option>
          <option value="vendido">Vendido</option>
        </select>

        {/* UBICACIÓN SOLO ADMIN */}
        {isAdmin && (
          <input
            type="text"
            placeholder="Filtrar por ubicación"
            value={filters.ubicacion}
            onChange={(e) => {
              setPage(1)
              setFilters({ ...filters, ubicacion: e.target.value })
            }}
            className="border rounded-xl px-3 py-2 text-sm"
          />
        )}

        {/* LIMIT */}
        <select
          value={meta.limit}
          onChange={(e) => {
            setPage(1)
            setMeta((m) => ({ ...m, limit: Number(e.target.value) }))
          }}
          className="border rounded-xl px-3 py-2 text-sm"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">Cargando inventario...</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left">Material</th>
                    <th className="px-4 py-3 text-left">Descripción</th>
                    <th className="px-4 py-3 text-left">Color</th>
                    <th className="px-4 py-3 text-left">Público</th>
                    <th className="px-4 py-3 text-left">Estatus</th>
                    <th className="px-4 py-3 text-left">Ubicación</th>
                  </tr>
                </thead>

                <tbody>
                  {inventario.map((item) => (
                    <tr key={item.material} className="border-b">
                      <td className="px-4 py-3 font-medium">{item.material}</td>
                      <td className="px-4 py-3">{item.descripcion}</td>
                      <td className="px-4 py-3">{item.color}</td>
                      <td className="px-4 py-3">${item.precio_publico}</td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.estatus === 'vendido'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {item.estatus}
                        </span>
                      </td>

                      <td className="px-4 py-3">{item.ubicacion_actual}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINACIÓN */}
            <div className="flex justify-between items-center p-4">
              <span className="text-sm text-gray-500">
                Total: {meta.total}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border px-3 py-1 rounded disabled:opacity-50"
                >
                  Anterior
                </button>

                <span className="text-sm">
                  {page} / {meta.total_pages || 1}
                </span>

                <button
                  onClick={() =>
                    setPage((p) =>
                      Math.min(meta.total_pages || 1, p + 1)
                    )
                  }
                  disabled={page >= (meta.total_pages || 1)}
                  className="border px-3 py-1 rounded disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}