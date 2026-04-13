import { useState } from 'react'
import client from '../api/client'
import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/useAuth'

export default function CrearNotaPage() {
  const { user } = useAuth()

  const [form, setForm] = useState({
    tipo: 'venta',
    origen: '',
    destino: '',
    cliente: '',
    comentario: '',
    materiales: '',
  })

  const [loading, setLoading] = useState(false)

  const isAdmin = ['super_admin', 'admin', 'control'].includes(user?.rol)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)

    try {
      const materialesArray = form.materiales
        .split(',')
        .map(m => m.trim())
        .filter(Boolean)

      const payload = {
        tipo: form.tipo,
        origen: form.origen,
        destino: form.destino,
        cliente: form.tipo === 'venta' ? form.cliente : '',
        comentario: form.comentario,
        materiales: materialesArray,
      }

      const res = await client.post('/notas', payload)

      alert('✅ Nota creada correctamente: ' + res.data.nota.folio)

      // reset
      setForm({
        tipo: 'venta',
        origen: '',
        destino: '',
        cliente: '',
        comentario: '',
        materiales: '',
      })

    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear nota')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Crear Nota</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow space-y-4">

          {/* Tipo */}
          <div>
            <label className="text-sm">Tipo</label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full border rounded-xl px-3 py-2"
            >
              <option value="venta">Venta</option>
              {isAdmin && <option value="remision">Remisión</option>}
            </select>
          </div>

          {/* Origen */}
          <div>
            <label className="text-sm">Origen</label>
            <input
              name="origen"
              value={form.origen}
              onChange={handleChange}
              className="w-full border rounded-xl px-3 py-2"
              required
            />
          </div>

          {/* Destino */}
          <div>
            <label className="text-sm">Destino</label>
            <input
              name="destino"
              value={form.destino}
              onChange={handleChange}
              className="w-full border rounded-xl px-3 py-2"
              required
            />
          </div>

          {/* Cliente */}
          {form.tipo === 'venta' && (
            <div>
              <label className="text-sm">Cliente</label>
              <input
                name="cliente"
                value={form.cliente}
                onChange={handleChange}
                className="w-full border rounded-xl px-3 py-2"
              />
            </div>
          )}

          {/* Comentario */}
          <div>
            <label className="text-sm">Comentario</label>
            <textarea
              name="comentario"
              value={form.comentario}
              onChange={handleChange}
              className="w-full border rounded-xl px-3 py-2"
            />
          </div>

          {/* Materiales */}
          <div>
            <label className="text-sm">
              Materiales (separados por coma)
            </label>
            <input
              name="materiales"
              value={form.materiales}
              onChange={handleChange}
              placeholder="MAT001, MAT002"
              className="w-full border rounded-xl px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl"
          >
            {loading ? 'Creando...' : 'Crear Nota'}
          </button>
        </form>
      </div>
    </AppLayout>
  )
}