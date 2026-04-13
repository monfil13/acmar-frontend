import { useEffect, useState } from 'react'
import client from '../api/client'
import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/useAuth'

export default function CrearNotaPage() {
  const { user } = useAuth()

  const [ubicaciones, setUbicaciones] = useState([])
  const [inventario, setInventario] = useState([])

  const [search, setSearch] = useState('')
  const [seleccionados, setSeleccionados] = useState([])

  const [form, setForm] = useState({
    tipo: 'venta',
    origen: '',
    destino: '',
    cliente: '',
    comentario: '',
  })

  const isAdmin = ['super_admin', 'admin', 'control'].includes(user?.rol)

  // 🔥 cargar ubicaciones
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

  // 🔥 cargar inventario
  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const res = await client.get('/inventario?limit=1000')
        setInventario(res.data.inventario || [])
      } catch (err) {
        console.error(err)
      }
    }

    fetchInventario()
  }, [])

  const filtered = inventario.filter((i) =>
    i.material.toLowerCase().includes(search.toLowerCase())
  )

  const addMaterial = (item) => {
    if (seleccionados.find(m => m.material === item.material)) return
    setSeleccionados([...seleccionados, item])
  }

  const removeMaterial = (material) => {
    setSeleccionados(seleccionados.filter(m => m.material !== material))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const payload = {
        ...form,
        materiales: seleccionados.map(m => m.material),
      }

      await client.post('/notas', payload)

      alert('✅ Nota creada')

      setSeleccionados([])
      setForm({
        tipo: 'venta',
        origen: '',
        destino: '',
        cliente: '',
        comentario: '',
      })

    } catch (err) {
      alert(err.response?.data?.message || 'Error')
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4">

        <h1 className="text-2xl font-bold">Crear Nota</h1>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl space-y-4">

          {/* Tipo */}
          <select name="tipo" value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            className="w-full border rounded-xl px-3 py-2"
          >
            <option value="venta">Venta</option>
            {isAdmin && <option value="remision">Remisión</option>}
          </select>

          {/* Origen */}
          <select
            value={form.origen}
            onChange={(e) => setForm({ ...form, origen: e.target.value })}
            className="w-full border rounded-xl px-3 py-2"
          >
            <option value="">Selecciona origen</option>
            {ubicaciones.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>

          {/* Destino */}
          <select
            value={form.destino}
            onChange={(e) => setForm({ ...form, destino: e.target.value })}
            className="w-full border rounded-xl px-3 py-2"
          >
            <option value="">Selecciona destino</option>
            {ubicaciones.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>

          {/* Cliente */}
          {form.tipo === 'venta' && (
            <input
              placeholder="Cliente"
              value={form.cliente}
              onChange={(e) => setForm({ ...form, cliente: e.target.value })}
              className="w-full border rounded-xl px-3 py-2"
            />
          )}

          {/* 🔍 Buscador */}
          <input
            placeholder="Buscar material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
          />

          {/* Lista */}
          <div className="max-h-40 overflow-auto border rounded-xl">
            {filtered.slice(0, 10).map((item) => (
              <div
                key={item.material}
                onClick={() => addMaterial(item)}
                className="px-3 py-2 hover:bg-slate-100 cursor-pointer"
              >
                {item.material} - {item.descripcion}
              </div>
            ))}
          </div>

          {/* Seleccionados */}
          <div className="flex flex-wrap gap-2">
            {seleccionados.map((m) => (
              <div key={m.material}
                className="bg-slate-900 text-white px-3 py-1 rounded-full flex gap-2">
                {m.material}
                <button onClick={() => removeMaterial(m.material)}>x</button>
              </div>
            ))}
          </div>

          <button className="bg-slate-900 text-white px-4 py-2 rounded-xl">
            Crear Nota
          </button>

        </form>
      </div>
    </AppLayout>
  )
}