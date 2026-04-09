import { useEffect, useMemo, useState } from 'react'
import client from '../api/client'
import AppLayout from '../layouts/AppLayout'

export default function NotasPage() {
  const [notas, setNotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, total_pages: 0, limit: 10 })

  const [filters, setFilters] = useState({
    tipo: '',
    desde: '',
    hasta: '',
    q: '',
  })

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(meta.limit))

    if (filters.tipo) params.set('tipo', filters.tipo)
    if (filters.desde) params.set('desde', filters.desde)
    if (filters.hasta) params.set('hasta', filters.hasta)
    if (filters.q) params.set('q', filters.q)

    return params.toString()
  }, [page, meta.limit, filters])

  useEffect(() => {
    const fetchNotas = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await client.get(`/notas?${queryString}`)
        setNotas(res.data.notas || [])
        setMeta((m) => ({
          ...m,
          total: res.data.total || 0,
          total_pages: res.data.total_pages || 0,
          limit: res.data.limit || m.limit,
        }))
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar notas')
      } finally {
        setLoading(false)
      }
    }

    fetchNotas()
  }, [queryString])

  const onFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const applyFilters = (e) => {
    e.preventDefault()
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({ tipo: '', desde: '', hasta: '', q: '' })
    setPage(1)
  }

  const openPdf = async (id) => {
    try {
      const res = await client.get(`/notas/${id}/pdf`, { responseType: 'blob' })
      const file = new Blob([res.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(file)
      window.open(url, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo abrir el PDF')
    }
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Notas</h1>
        <p className="text-slate-500">Ventas y remisiones con filtros y paginación</p>
      </div>

      <form onSubmit={applyFilters} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4">
        <div className="grid gap-3 md:grid-cols-5">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
            <select
              name="tipo"
              value={filters.tipo}
              onChange={onFilterChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="venta">Venta</option>
              <option value="remision">Remisión</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Desde</label>
            <input
              type="date"
              name="desde"
              value={filters.desde}
              onChange={onFilterChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Hasta</label>
            <input
              type="date"
              name="hasta"
              value={filters.hasta}
              onChange={onFilterChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Buscar</label>
            <input
              type="text"
              name="q"
              value={filters.q}
              onChange={onFilterChange}
              placeholder="Folio, cliente, origen, destino..."
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            type="submit"
            className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800"
          >
            Aplicar
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Limpiar
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-500">Por página</span>
            <select
              value={meta.limit}
              onChange={(e) => {
                setMeta((m) => ({ ...m, limit: Number(e.target.value) }))
                setPage(1)
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">Cargando notas...</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3">Folio</th>
                    <th className="text-left px-4 py-3">Tipo</th>
                    <th className="text-left px-4 py-3">Fecha</th>
                    <th className="text-left px-4 py-3">Origen</th>
                    <th className="text-left px-4 py-3">Destino</th>
                    <th className="text-left px-4 py-3">Cliente</th>
                    <th className="text-left px-4 py-3">Comentario</th>
                    <th className="text-left px-4 py-3">PDF</th>
                  </tr>
                </thead>

                <tbody>
                  {notas.map((n) => (
                    <tr key={n.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-800">{n.folio}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            n.tipo === 'venta'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {n.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {n.created_at ? new Date(n.created_at).toLocaleString('es-MX') : ''}
                      </td>
                      <td className="px-4 py-3">{n.origen}</td>
                      <td className="px-4 py-3">{n.destino}</td>
                      <td className="px-4 py-3">{n.cliente || '-'}</td>
                      <td className="px-4 py-3 max-w-[260px] truncate" title={n.comentario || ''}>
                        {n.comentario || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => openPdf(n.id)} className="text-slate-900 underline">
                          Abrir
                        </button>
                      </td>
                    </tr>
                  ))}

                  {notas.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={8}>
                        No hay notas con esos filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <p className="text-sm text-slate-500">Total: {meta.total} notas</p>

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