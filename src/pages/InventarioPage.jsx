import { useEffect, useState } from 'react'
import client from '../api/client'
import AppLayout from '../layouts/AppLayout'

export default function InventarioPage() {
  const [inventario, setInventario] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  const [meta, setMeta] = useState({
    total: 0,
    total_pages: 0,
    limit: 5,
  })

  useEffect(() => {
    const fetchInventario = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await client.get(`/inventario?page=${page}&limit=${meta.limit}`)
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
  }, [page, meta.limit])

  return (
    <AppLayout>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
          <p className="text-slate-500">Consulta de equipos con paginación</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Por página</span>
          <select
            value={meta.limit}
            onChange={(e) => {
              setPage(1)
              setMeta((m) => ({ ...m, limit: Number(e.target.value) }))
            }}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

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
                    <th className="text-left px-4 py-3">Material</th>
                    <th className="text-left px-4 py-3">Descripción</th>
                    <th className="text-left px-4 py-3">Color</th>
                    <th className="text-left px-4 py-3">Mayoreo</th>
                    <th className="text-left px-4 py-3">Público</th>
                    <th className="text-left px-4 py-3">Estatus</th>
                    <th className="text-left px-4 py-3">Ubicación</th>
                  </tr>
                </thead>

                <tbody>
                  {inventario.map((item) => (
                    <tr key={item.material} className="border-b border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-800">{item.material}</td>
                      <td className="px-4 py-3">{item.descripcion}</td>
                      <td className="px-4 py-3">{item.color}</td>
                      <td className="px-4 py-3">${item.precio_mayoreo}</td>
                      <td className="px-4 py-3">${item.precio_publico}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            item.estatus === 'vendido'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {item.estatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">{item.ubicacion_actual}</td>
                    </tr>
                  ))}

                  {inventario.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={7}>
                        No hay inventario para mostrar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <p className="text-sm text-slate-500">Total: {meta.total} registros</p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-slate-300 px-4 py-2 disabled:opacity-50"
                >
                  Anterior
                </button>

                <span className="text-sm text-slate-600">
                  Página {page} de {meta.total_pages || 1}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(meta.total_pages || 1, p + 1))}
                  disabled={page >= (meta.total_pages || 1)}
                  className="rounded-xl border border-slate-300 px-4 py-2 disabled:opacity-50"
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