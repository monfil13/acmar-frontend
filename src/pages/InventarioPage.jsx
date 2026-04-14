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

  const [selectedItem, setSelectedItem] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const isAdmin =
    ['admin', 'super_admin', 'control'].includes(user?.rol)

  /** =========================
   * UBICACIONES
   * ========================= */
  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const res = await client.get('/inventario/ubicaciones')
        setUbicaciones(res.data || [])
      } catch (error) {
        console.error('Error cargando ubicaciones:', error)
      }
    }

    fetchUbicaciones()
  }, [])

  /** =========================
   * INVENTARIO
   * ========================= */
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
    } catch (error) {
      console.error('Error cargando inventario:', error)
      setError(error.response?.data?.message || 'Error al cargar inventario')
    }
  }

  useEffect(() => {
    fetchInventario()
  }, [filters])

  /** =========================
   * GUARDAR
   * ========================= */
  const saveEdit = async () => {
    try {
      setSaving(true)

      await client.patch(`/inventario/${editingItem.material}`, {
        descripcion: form.descripcion,
        color: form.color,
        estatus: form.estatus,
        ubicacion_actual: form.ubicacion_actual,
      })

      await fetchInventario()

      setEditingItem(null)
      setForm({})

    } catch (error) {
      console.error('Error actualizando:', error)
      alert('Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Inventario</h1>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl border mb-4 flex gap-3 flex-wrap">

        <input
          placeholder="Buscar por material o descripción..."
          value={filters.q}
          onChange={(e) =>
            setFilters({ ...filters, q: e.target.value })
          }
          className="border px-3 py-2 rounded w-60"
        />

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

      {/* TABLA */}
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
                <th className="px-3 py-2">Estatus</th>
                <th className="px-3 py-2">Ubicación</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {inventario.map((item) => (
                <tr key={item.material} className="border-t">

                  <td className="px-3 py-2">{item.material}</td>
                  <td className="px-3 py-2">{item.descripcion}</td>
                  <td className="px-3 py-2">{item.color}</td>

                  <td className="px-3 py-2">{item.estatus}</td>

                  <td className="px-3 py-2">{item.ubicacion_actual}</td>

                  <td className="px-3 py-2 flex gap-2">

                    <button
                      onClick={() => setSelectedItem(item)}
                      className="text-gray-700 hover:underline"
                    >
                      Ver
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setEditingItem(item)
                          setForm(item)
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Editar
                      </button>
                    )}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL VER */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[600px]">

            <h2 className="text-lg font-bold mb-4">Detalle del equipo</h2>

            <div className="space-y-2 text-sm">

              <div>
                <label className="font-semibold">Material</label>
                <p>{selectedItem.material}</p>
              </div>

              <div>
                <label className="font-semibold">Descripción</label>
                <p>{selectedItem.descripcion}</p>
              </div>

              <div>
                <label className="font-semibold">Color</label>
                <p>{selectedItem.color}</p>
              </div>

              <div>
                <label className="font-semibold">Estatus</label>
                <p>{selectedItem.estatus}</p>
              </div>

              <div>
                <label className="font-semibold">Ubicación</label>
                <p>{selectedItem.ubicacion_actual}</p>
              </div>

            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 border rounded"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[600px]">

            <h2 className="text-lg font-bold mb-4">Editar equipo</h2>

            <div className="space-y-3">

              <div>
                <label className="block text-sm font-medium">Material</label>
                <input
                  value={form.material || ''}
                  disabled
                  className="w-full border p-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Descripción</label>
                <input
                  value={form.descripcion || ''}
                  onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                  }
                  className="w-full border p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Color</label>
                <input
                  value={form.color || ''}
                  onChange={(e) =>
                    setForm({ ...form, color: e.target.value })
                  }
                  className="w-full border p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Estatus</label>
                <select
                  value={form.estatus || ''}
                  onChange={(e) =>
                    setForm({ ...form, estatus: e.target.value })
                  }
                  className="w-full border p-2"
                >
                  <option value="disponible">Disponible</option>
                  <option value="vendido">Vendido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Ubicación</label>
                <select
                  value={form.ubicacion_actual || ''}
                  onChange={(e) =>
                    setForm({ ...form, ubicacion_actual: e.target.value })
                  }
                  className="w-full border p-2"
                >
                  <option value="">Seleccionar ubicación</option>
                  {ubicaciones.map((u, i) => (
                    <option key={i} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="flex justify-end gap-2 mt-4">

              <button
                onClick={() => {
                  setEditingItem(null)
                  setForm({})
                }}
                className="px-4 py-2 border rounded"
              >
                Cancelar
              </button>

              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>

            </div>

          </div>
        </div>
      )}

    </AppLayout>
  )
}