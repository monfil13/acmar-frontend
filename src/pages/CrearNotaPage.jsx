import { useEffect, useState } from 'react'
import client from '../api/client'
import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/useAuth'
import {
  isPuntoVenta,
  canCreateRemision,
  canSelectOrigen,
} from '../utils/permissions'

export default function CrearNotaPage() {
  const { user } = useAuth()

  const esPV = isPuntoVenta(user?.rol)

  const [form, setForm] = useState({
    tipo: 'venta',
    origen: '',
    destino: '',
    cliente: '',
    comentario: '',
    materiales: [],
  })

  const [ubicaciones, setUbicaciones] = useState([])
  const [inventario, setInventario] = useState([])

  const [loading, setLoading] = useState(false)
  const [loadingInv, setLoadingInv] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const clientes = ['CLIENTE GENERAL', 'CLIENTE MAYOREO']

  /** =========================
   * AUTO ORIGEN PARA PV
   * ========================= */
  useEffect(() => {
    if (esPV && user?.ubicacion) {
      setForm((prev) => ({
        ...prev,
        origen: user.ubicacion,
      }))
    }
  }, [user])

  /** =========================
   * UBICACIONES (solo admin)
   * ========================= */
  useEffect(() => {
    if (!canSelectOrigen(user?.rol)) return

    const fetchUbicaciones = async () => {
      try {
        const res = await client.get('/inventario/ubicaciones')

        const limpias = (res.data || []).filter(
          (u) => !u?.toUpperCase().includes('CLIENTE')
        )

        setUbicaciones(limpias)
      } catch (err) {
        console.error('Error ubicaciones:', err)
      }
    }

    fetchUbicaciones()
  }, [user])

  /** =========================
   * INVENTARIO
   * ========================= */
  useEffect(() => {
    if (!form.origen) {
      setInventario([])
      return
    }

    const fetchInventario = async () => {
      try {
        setLoadingInv(true)

        const res = await client.get('/inventario', {
          params: {
            ubicacion: form.origen,
            estatus: 'disponible',
          },
        })

        setInventario(res.data.inventario || [])
      } catch (err) {
        console.error('Error inventario:', err)
      } finally {
        setLoadingInv(false)
      }
    }

    fetchInventario()
  }, [form.origen])

  /** =========================
   * INPUTS
   * ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'origen') {
      return setForm((prev) => ({
        ...prev,
        origen: value,
        materiales: [],
      }))
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  /** =========================
   * MATERIALES
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
   * SUBMIT
   * ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.origen) return setError('Origen requerido')
    if (!form.materiales.length) return setError('Selecciona equipos')

    if (form.tipo === 'venta' && !form.cliente) {
      return setError('Selecciona cliente')
    }

    if (form.tipo === 'remision' && !form.destino) {
      return setError('Selecciona destino')
    }

    try {
      setLoading(true)

      await client.post('/notas', {
        tipo: form.tipo,
        origen: form.origen,
        destino:
          form.tipo === 'venta'
            ? form.cliente
            : form.destino,
        cliente:
          form.tipo === 'venta'
            ? form.cliente
            : null,
        comentario: form.comentario,
        materiales: form.materiales,
      })

      setSuccess('✅ Nota creada correctamente')

      setForm({
        tipo: 'venta',
        origen: esPV ? user?.ubicacion : '',
        destino: '',
        cliente: '',
        comentario: '',
        materiales: [],
      })

      setInventario([])

    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear nota')
    } finally {
      setLoading(false)
    }
  }

  /** =========================
   * UI
   * ========================= */
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Crear Nota</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow space-y-5"
      >

        {/* TIPO */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Tipo de movimiento
          </label>

          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="venta">Venta</option>

            {canCreateRemision(user?.rol) && (
              <option value="remision">Remisión</option>
            )}
          </select>
        </div>

        {/* ORIGEN SOLO ADMIN */}
        {canSelectOrigen(user?.rol) && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Origen
            </label>

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
        )}

        {/* CLIENTE */}
        {form.tipo === 'venta' && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Cliente
            </label>

            <select
              name="cliente"
              value={form.cliente}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Seleccionar</option>
              {clientes.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* DESTINO */}
        {form.tipo === 'remision' && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Destino
            </label>

            <select
              name="destino"
              value={form.destino}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Seleccionar</option>
              {ubicaciones.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
        )}

        {/* COMENTARIO */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Comentario
          </label>

          <textarea
            name="comentario"
            value={form.comentario}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded px-3 py-2"
            placeholder="Opcional..."
          />
        </div>

        {/* INVENTARIO */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Equipos en {form.origen || '...'}
          </label>

          <div className="max-h-64 overflow-y-auto border rounded p-2">

            {!form.origen && (
              <p className="text-gray-400 text-sm">
                Selecciona origen
              </p>
            )}

            {loadingInv && (
              <p className="text-sm text-gray-500">
                Cargando equipos...
              </p>
            )}

            {!loadingInv && inventario.length === 0 && form.origen && (
              <p className="text-sm text-gray-500">
                No hay equipos disponibles
              </p>
            )}

            {!loadingInv && inventario.map((item) => (
              <label
                key={item.material}
                className="flex items-center gap-2 text-sm mb-1 hover:bg-gray-50 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={form.materiales.includes(item.material)}
                  onChange={() => toggleMaterial(item.material)}
                />
                <span className="font-medium">{item.material}</span>
                <span className="text-gray-500">
                  {item.descripcion}
                </span>
              </label>
            ))}

          </div>
        </div>

        {/* MENSAJES */}
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        {/* BOTÓN */}
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