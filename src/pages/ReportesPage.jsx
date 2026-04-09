import { useMemo, useState } from 'react'
import client from '../api/client'
import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/useAuth'

export default function ReportesPage() {
  const { user } = useAuth()

  const [tab, setTab] = useState('ventas') // ventas | notas | inventario | corte
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  // filtros comunes
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [q, setQ] = useState('')
  const [tipoNota, setTipoNota] = useState('') // venta|remision para reportes/notas
  const [estatusInv, setEstatusInv] = useState('') // disponible|vendido
  const [ubicacion, setUbicacion] = useState('') // solo admin/control (si lo mandas y eres PV, se ignora en backend)
  const [usuarioId, setUsuarioId] = useState('') // solo admin/control
  const [fechaCorte, setFechaCorte] = useState(new Date().toISOString().slice(0, 10))

  // paginación (para ventas/notas)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const canUseAdminFilters = useMemo(() => {
    return ['super_admin', 'admin', 'control'].includes(user?.rol)
  }, [user?.rol])

  const resetState = () => {
    setError('')
    setResult(null)
    setPage(1)
  }

  const buildParams = () => {
    const params = new URLSearchParams()

    // paginación cuando aplique
    if (tab === 'ventas' || tab === 'notas') {
      params.set('page', String(page))
      params.set('limit', String(limit))
    }

    // filtros
    if (desde) params.set('desde', desde)
    if (hasta) params.set('hasta', hasta)

    if (tab === 'notas') {
      if (tipoNota) params.set('tipo', tipoNota)
      if (q) params.set('q', q)
    }

    if (tab === 'ventas') {
      // ventas solo usa desde/hasta, pero dejamos q fuera a propósito
    }

    if (tab === 'inventario') {
      if (estatusInv) params.set('estatus', estatusInv)
      if (q) params.set('q', q)
    }

    if (tab === 'corte') {
      if (fechaCorte) params.set('fecha', fechaCorte)
    }

    // filtros admin/control
    if (canUseAdminFilters) {
      if (ubicacion) params.set('ubicacion', ubicacion)
      if (usuarioId) params.set('usuario_id', usuarioId)
    }

    return params
  }

  const endpoint = useMemo(() => {
    if (tab === 'ventas') return '/reportes/ventas'
    if (tab === 'notas') return '/reportes/notas'
    if (tab === 'inventario') return '/reportes/inventario'
    if (tab === 'corte') return '/reportes/corte'
    return '/reportes/ventas'
  }, [tab])

  const fetchReport = async () => {
    setLoading(true)
    setError('')
    try {
      const params = buildParams()
      const res = await client.get(`${endpoint}?${params.toString()}`)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar reporte')
    } finally {
      setLoading(false)
    }
  }

  const openPdf = async (pdfEndpoint) => {
    setLoading(true)
    setError('')
    try {
      const params = buildParams()
      const res = await client.get(`${pdfEndpoint}?${params.toString()}`, { responseType: 'blob' })
      const file = new Blob([res.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(file)
      window.open(url, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo abrir el PDF')
    } finally {
      setLoading(false)
    }
  }

  const onChangeTab = (next) => {
    setTab(next)
    resetState()
  }

  const isPaginated = tab === 'ventas' || tab === 'notas'

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Reportes</h1>
        <p className="text-slate-500">Ventas, notas, inventario y corte</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <TabButton active={tab === 'ventas'} onClick={() => onChangeTab('ventas')}>Ventas</TabButton>
        <TabButton active={tab === 'notas'} onClick={() => onChangeTab('notas')}>Notas</TabButton>
        <TabButton active={tab === 'inventario'} onClick={() => onChangeTab('inventario')}>Inventario</TabButton>
        <TabButton active={tab === 'corte'} onClick={() => onChangeTab('corte')}>Corte</TabButton>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4">
        <div className="grid gap-3 md:grid-cols-6">
          {(tab === 'ventas' || tab === 'notas') && (
            <>
              <Field label="Desde">
                <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Hasta">
                <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className={inputCls} />
              </Field>
            </>
          )}

          {tab === 'notas' && (
            <Field label="Tipo">
              <select value={tipoNota} onChange={(e) => setTipoNota(e.target.value)} className={inputCls}>
                <option value="">Todos</option>
                <option value="venta">Venta</option>
                <option value="remision">Remisión</option>
              </select>
            </Field>
          )}

          {tab === 'inventario' && (
            <Field label="Estatus">
              <select value={estatusInv} onChange={(e) => setEstatusInv(e.target.value)} className={inputCls}>
                <option value="">Todos</option>
                <option value="disponible">Disponible</option>
                <option value="vendido">Vendido</option>
              </select>
            </Field>
          )}

          {(tab === 'inventario' || tab === 'notas') && (
            <Field label="Buscar">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={tab === 'inventario' ? 'Material, ICCID, número...' : 'Folio, cliente, origen...'}
                className={inputCls}
              />
            </Field>
          )}

          {tab === 'corte' && (
            <Field label="Fecha">
              <input type="date" value={fechaCorte} onChange={(e) => setFechaCorte(e.target.value)} className={inputCls} />
            </Field>
          )}

          {canUseAdminFilters && (
            <>
              <Field label="Ubicación (admin)">
                <input value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} className={inputCls} placeholder="PUNTO VENTA..." />
              </Field>
              <Field label="Usuario ID (admin)">
                <input value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} className={inputCls} placeholder="uuid..." />
              </Field>
            </>
          )}

          {isPaginated && (
            <>
              <Field label="Page">
                <input
                  type="number"
                  min="1"
                  value={page}
                  onChange={(e) => setPage(Number(e.target.value || 1))}
                  className={inputCls}
                />
              </Field>
              <Field label="Limit">
                <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }} className={inputCls}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </Field>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? 'Generando...' : 'Generar'}
          </button>

          <button
            onClick={() => {
              setDesde('')
              setHasta('')
              setQ('')
              setTipoNota('')
              setEstatusInv('')
              setUbicacion('')
              setUsuarioId('')
              setFechaCorte(new Date().toISOString().slice(0, 10))
              resetState()
            }}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Limpiar
          </button>

          {/* PDFs disponibles */}
          <div className="ml-auto flex items-center gap-2">
            {tab === 'corte' && (
              <button
                onClick={() => openPdf('/reportes/corte/pdf')}
                disabled={loading}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
              >
                PDF corte
              </button>
            )}

            {tab === 'notas' && (
              <button
                onClick={() => openPdf('/reportes/notas/pdf')}
                disabled={loading}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
              >
                PDF notas
              </button>
            )}
          </div>
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>

      {/* Resultado */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        {!result ? (
          <div className="text-slate-500 text-sm">Genera un reporte para ver resultados.</div>
        ) : (
          <pre className="text-xs overflow-auto max-h-[520px] bg-slate-50 border border-slate-200 rounded-xl p-3">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </AppLayout>
  )
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-medium border transition ${
        active
          ? 'bg-slate-900 text-white border-slate-900'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
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

const inputCls = 'w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white'