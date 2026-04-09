import { useEffect, useMemo, useState } from 'react'
import client from '../api/client'
import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/useAuth'

export default function VentasPage() {
  const { user } = useAuth()
  const isAdmin = useMemo(() => ['super_admin', 'admin', 'control'].includes(user?.rol), [user?.rol])

  const [filters, setFilters] = useState({
    desde: '',
    hasta: '',
    ubicacion: '',
    usuario_id: '',
  })

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [meta, setMeta] = useState({
    total: 0,
    total_pages: 0,
  })

  const [totales, setTotales] = useState({
    total_notas: 0,
    total_items: 0,
    total_mayoreo: 0,
    total_publico: 0,
  })

  const [ventas, setVentas] = useState([])

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(limit))

    if (filters.desde) params.set('desde', filters.desde)
    if (filters.hasta) params.set('hasta', filters.hasta)

    if (isAdmin) {
      if (filters.ubicacion) params.set('ubicacion', filters.ubicacion)
      if (filters.usuario_id) params.set('usuario_id', filters.usuario_id)
    }

    return params.toString()
  }, [page, limit, filters, isAdmin])

  const fetchVentas = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await client.get(`/reportes/ventas?${queryString}`)

      setVentas(res.data.ventas || [])
      setTotales(res.data.totales || {
        total_notas: 0,
        total_items: 0,
        total_mayoreo: 0,
        total_publico: 0,
      })

      setMeta({
        total: res.data.total || 0,
        total_pages: res.data.total_pages || 0,
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar reporte de ventas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVentas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString])

  const onChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const applyFilters = (e) => {
    e.preventDefault()
    setPage(1)
    fetchVentas()
  }

  const clearFilters = () => {
    setFilters({ desde: '', hasta: '', ubicacion: '', usuario_id: '' })
    setPage(1)
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Ventas</h1>
        <p className="text-slate-500">Reporte de ventas con filtros y paginación</p>
      </div>

      {/* Filtros */}
      <form onSubmit={applyFilters} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4">
        <div className="grid gap-3 md:grid-cols-6">
          <Field label="Desde">
            <input type="date" name="desde" value={filters.desde} onChange={onChange} className={inputCls} />
          </Field>

          <Field label="Hasta">
            <input type="date" name="hasta" value={filters.hasta} onChange={onChange} className={inputCls} />
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

          <Field label="Por página">
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
              className={inputCls}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </Field>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? 'Cargando...' : 'Aplicar'}
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Limpiar
          </button>
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </form>

      {/* Totales */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-4">
        <Card title="Total notas" value={totales.total_notas} />
        <Card title="Total equipos" value={totales.total_items} />
        <Card title="Total mayoreo" value={`$${Number(totales.total_mayoreo || 0)}`} />
        <Card title="Total público" value={`$${Number(totales.total_publico || 0)}`} />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">Cargando ventas...</div>
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
                        No hay ventas con esos filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between px-4 py-4">
              <p className="text-sm text-slate-500">Total: {meta.total} ventas</p>

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