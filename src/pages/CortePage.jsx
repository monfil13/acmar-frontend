import { useEffect, useMemo, useState } from 'react'
import client from '../api/client'
import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/useAuth'

export default function CortePage() {
  const { user } = useAuth()
  const isAdmin = useMemo(() => ['super_admin', 'admin', 'control'].includes(user?.rol), [user?.rol])

  const [filters, setFilters] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    ubicacion: '',
    usuario_id: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [resumen, setResumen] = useState({
    total_notas: 0,
    total_items: 0,
    total_mayoreo: 0,
    total_publico: 0,
  })

  const [ventas, setVentas] = useState([])

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.fecha) params.set('fecha', filters.fecha)

    if (isAdmin) {
      if (filters.ubicacion) params.set('ubicacion', filters.ubicacion)
      if (filters.usuario_id) params.set('usuario_id', filters.usuario_id)
    }

    return params.toString()
  }, [filters, isAdmin])

  const fetchCorte = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await client.get(`/reportes/corte?${queryString}`)

      setResumen(res.data.resumen || {
        total_notas: 0,
        total_items: 0,
        total_mayoreo: 0,
        total_publico: 0,
      })

      setVentas(res.data.ventas || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar corte')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCorte()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString])

  const onChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const clearFilters = () => {
    setFilters({
      fecha: new Date().toISOString().slice(0, 10),
      ubicacion: '',
      usuario_id: '',
    })
  }

  const openPdf = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await client.get(`/reportes/corte/pdf?${queryString}`, { responseType: 'blob' })
      const file = new Blob([res.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(file)
      window.open(url, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo abrir el PDF del corte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Corte</h1>
          <p className="text-slate-500">Resumen diario de ventas + PDF</p>
        </div>

        <button
          onClick={openPdf}
          disabled={loading}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
        >
          PDF Corte
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4">
        <div className="grid gap-3 md:grid-cols-6">
          <Field label="Fecha">
            <input type="date" name="fecha" value={filters.fecha} onChange={onChange} className={inputCls} />
          </Field>

          {isAdmin && (
            <>
              <Field label="Ubicación (admin)">
                <input
                  name="ubicacion"
                  value={filters.ubicacion}
                  onChange={onChange}
                  className={inputCls}
                  placeholder="PUNTO VENTA..."
                />
              </Field>

              <Field label="Usuario ID (admin)">
                <input
                  name="usuario_id"
                  value={filters.usuario_id}
                  onChange={onChange}
                  className={inputCls}
                  placeholder="uuid..."
                />
              </Field>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={fetchCorte}
            disabled={loading}
            className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? 'Generando...' : 'Actualizar'}
          </button>

          <button
            onClick={clearFilters}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Limpiar
          </button>
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>

      {/* Totales */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-4">
        <Card title="Total notas" value={resumen.total_notas} />
        <Card title="Total equipos" value={resumen.total_items} />
        <Card title="Total mayoreo" value={`$${Number(resumen.total_mayoreo || 0)}`} />
        <Card title="Total público" value={`$${Number(resumen.total_publico || 0)}`} />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">Cargando corte...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3">Folio</th>
                    <th className="text-left px-4 py-3">Fecha</th>
                    <th className="text-left px-4 py-3">Origen</th>
                    <th className="text-left px-4 py-3">Destino</th>
                    <th className="text-left px-4 py-3">Cliente</th>
                    <th className="text-left px-4 py-3">Comentario</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((v) => (
                    <tr key={v.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-800">{v.folio}</td>
                      <td className="px-4 py-3">
                        {v.created_at ? new Date(v.created_at).toLocaleString('es-MX') : ''}
                      </td>
                      <td className="px-4 py-3">{v.origen}</td>
                      <td className="px-4 py-3">{v.destino}</td>
                      <td className="px-4 py-3">{v.cliente || '-'}</td>
                      <td className="px-4 py-3 max-w-[320px] truncate" title={v.comentario || ''}>
                        {v.comentario || '-'}
                      </td>
                    </tr>
                  ))}

                  {!loading && ventas.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={6}>
                        No hay ventas para esta fecha.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
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

const inputCls = 'w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white'