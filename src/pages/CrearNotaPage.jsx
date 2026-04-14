import { useEffect, useState } from 'react'
import client from '../api/client'
import AppLayout from '../layouts/AppLayout'

export default function CrearNotaPage() {
  const [form, setForm] = useState({
    tipo: 'venta',
    origen: '',
    destino: '',
    cliente: '',
    comentario: '',
    materiales: [],
  })

  const [ubicaciones, setUbicaciones] = useState([])
const clientes = [
  'CLIENTE GENERAL',
  'CLIENTE MAYOREO',
  'DISTRIBUIDOR',
] 

  const [inventario, setInventario] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  /** =========================
   * Cargar ubicaciones
   * ========================= */
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

  /** =========================
   * Cargar inventario
   * ========================= */
  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const res = await client.get('/inventario')
        setInventario(res.data.inventario || [])
      } catch (err) {
        console.error(err)
      }
    }

    fetchInventario()
  }, [])

  /** =========================
   * Manejo inputs
   * ========================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  /** =========================
   * Selección de materiales
   * ========================= */
  const toggleMaterial = (material) => {
    setForm((prev) => {
      const exists = prev.materiales.includes(material)

      return {
        ...prev,
        materiales: exists
          ? prev.materiales.filter((m) => m !== material)
          : [...prev.materiales, material],
      }
    })
  }

  /** =========================
   * Enviar nota
   * ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.origen) {
      return setError('Selecciona origen')
    }

    if (form.tipo === 'venta' && !form.cliente) {
      return setError('Selecciona cliente')
    }

    if (form.tipo === 'remision' && !form.destino) {
      return setError('Selecciona destino')
    }

    if (form.materiales.length === 0) {
      return setError('Selecciona al menos un material')
    }

    try {
      setLoading(true)

      await client.post('/notas', {
        tipo: form.tipo,
        origen: form.origen,
        destino: form.tipo === 'venta' ? form.cliente : form.destino,
        cliente: form.tipo === 'venta' ? form.cliente : null,
        comentario: form.comentario,
        materiales: form.materiales,
      })

      setSuccess('✅ Nota creada correctamente')

      // Reset
      setForm({
        tipo: 'venta',
        origen: '',
        destino: '',
        cliente: '',
        comentario: '',
        materiales: [],
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear nota')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Crear Nota</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow space-y-4">

        {/* Tipo */}
        <div>
          <label className="block text-sm mb-1">Tipo</label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="venta">Venta</option>
            <option value="remision">Remisión</option>
          </select>
        </div>

        {/* Origen */}
        <div>
          <label className="block text-sm mb-1">Origen</label>
          <select
            name="origen"
            value={form.origen}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Seleccionar</option>
            {ubicaciones.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Cliente (VENTA) */}
        {form.tipo === 'venta' && (
          <div>
            <label className="block text-sm mb-1">Cliente</label>
            <select
              name="cliente"
              value={form.cliente}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Seleccionar</option>
              {clientes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* Destino (REMISIÓN) */}
        {form.tipo === 'remision' && (
          <div>
            <label className="block text-sm mb-1">Destino</label>
            <select
              name="destino"
              value={form.destino}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Seleccionar</option>
              {ubicaciones.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        )}

        {/* Comentarios */}
        <div>
          <label className="block text-sm mb-1">Comentario</label>
          <textarea
            name="comentario"
            value={form.comentario}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded px-3 py-2"
            placeholder="Opcional..."
          />
        </div>

        {/* Materiales */}
        <div>
          <label className="block text-sm mb-2">Seleccionar materiales</label>

          <div className="max-h-60 overflow-y-auto border rounded p-2">
            {inventario.map((item) => (
              <label key={item.material} className="flex items-center gap-2 text-sm mb-1">
                <input
                  type="checkbox"
                  checked={form.materiales.includes(item.material)}
                  onChange={() => toggleMaterial(item.material)}
                />
                {item.material} - {item.descripcion}
              </label>
            ))}
          </div>
        </div>

        {/* Mensajes */}
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800"
        >
          {loading ? 'Guardando...' : 'Crear Nota'}
        </button>
      </form>
    </AppLayout>
  )
}