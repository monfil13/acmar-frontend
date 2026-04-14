import { useMemo, useState } from 'react'
import client from '../api/client'
import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/useAuth'

export default function CargaExcelPage() {
  const { user } = useAuth()

  const role = (user?.rol || '').toString().trim().toLowerCase()

  const canUpload = useMemo(() => {
    return ['super_admin', 'admin', 'control'].includes(role)
  }, [role])

  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  /** =========================
   * 📥 Descargar plantilla
   * ========================= */
  const downloadTemplate = () => {
    const headers = [
      'FACTURA',
      'MATERIAL',
      'DESCRIPCION',
      'COLOR',
      'CANTIDAD',
      'DISTRIBUIDOR',
      'PUBLICO',
      'FECHA_COMPRA',
      'IMEI',
      'IMEI_2',
      'ICCID',
      'FECHA_SALIDA',
      'NUMERO',
      'ORDEN_BES',
      'FOLIO',
      'FECHA_ACT',
      'ESQUEMA_COBRO',
      'FECHA_VENTA',
      'CLIENTE',
      'COMENTARIOS'
    ]

    const csvContent = [headers.join(',')].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'plantilla_inventario.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /** =========================
   * 📂 Manejo archivo
   * ========================= */
  const onFileChange = (e) => {
    const f = e.target.files?.[0]
    setError('')
    setResult(null)
    setFile(f || null)
  }

  /** =========================
   * 🚀 Subir Excel
   * ========================= */
  const upload = async () => {
    setError('')
    setResult(null)

    if (!file) {
      setError('Selecciona un archivo .xlsx')
      return
    }

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setError('El archivo debe ser .xlsx')
      return
    }

    setLoading(true)

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await client.post('/inventario/excel', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar Excel')
    } finally {
      setLoading(false)
    }
  }

  /** =========================
   * 🔄 Reset
   * ========================= */
  const reset = () => {
    setFile(null)
    setError('')
    setResult(null)
    const input = document.querySelector('input[type="file"]')
    if (input) input.value = ''
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Carga Excel</h1>
        <p className="text-slate-500">Carga masiva de inventario (.xlsx)</p>
      </div>

      {!canUpload ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <p className="text-slate-800 font-medium">Sin permisos</p>
          <p className="text-slate-500 text-sm mt-1">
            Tu rol ({user?.rol || 'N/A'}) no puede cargar inventario por Excel.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">

              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Archivo Excel (.xlsx)
                </label>

                <input
                  type="file"
                  accept=".xlsx"
                  onChange={onFileChange}
                  className="block w-full text-sm"
                />

                <p className="text-xs text-slate-500 mt-2">
                  Usa la plantilla oficial para evitar errores de formato.
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">

                <button
                  onClick={downloadTemplate}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Descargar plantilla
                </button>

                <button
                  onClick={upload}
                  disabled={loading}
                  className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-60"
                >
                  {loading ? 'Subiendo...' : 'Subir'}
                </button>

                <button
                  onClick={reset}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Limpiar
                </button>

              </div>
            </div>

            {error && (
              <div className="mt-3 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}
          </div>

          {result && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">

              <h2 className="text-lg font-semibold text-slate-800 mb-2">
                Resultado de carga
              </h2>

              <p className="text-sm text-green-600">
                ✔ Insertados: {result.insertados || 0}
              </p>

              {result.errores?.length > 0 && (
                <>
                  <p className="text-sm text-red-600 mt-2">
                    ⚠ Errores: {result.errores.length}
                  </p>

                  <div className="mt-2 max-h-40 overflow-auto text-xs bg-slate-50 p-2 rounded">
                    {result.errores.map((e, i) => (
                      <div key={i}>
                        ❌ {e.error}
                      </div>
                    ))}
                  </div>
                </>
              )}

            </div>
          )}
        </>
      )}
    </AppLayout>
  )
}