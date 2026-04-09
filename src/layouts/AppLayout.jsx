import { Link, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { useAuth } from '../context/useAuth'

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const role = (user?.rol || '').toString().trim().toLowerCase()

  const canSeeExcel = useMemo(() => {
    return ['super_admin', 'admin', 'control'].includes(role)
  }, [role])

  const menu = useMemo(() => {
    const items = [
      { to: '/', label: 'Dashboard' },
      { to: '/inventario', label: 'Inventario' },
      { to: '/notas', label: 'Notas' },
      { to: '/ventas', label: 'Ventas' },
      { to: '/corte', label: 'Corte' },
    ]

    if (canSeeExcel) {
      items.push({ to: '/carga-excel', label: 'Carga Excel' })
    }

    return items
  }, [canSeeExcel])

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white p-5 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">ACMAR</h1>
          <p className="text-sm text-slate-300">Inventario</p>
        </div>

        <nav className="space-y-2">
          {menu.map((item) => {
            const active = location.pathname === item.to

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`block rounded-xl px-4 py-2 transition ${
                  active
                    ? 'bg-white text-slate-900 font-semibold'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-700">
          <p className="text-sm font-medium">{user?.email || '-'}</p>
          <p className="text-xs text-slate-300 mt-1">
            {user?.rol || '-'} {user?.ubicacion ? `· ${user.ubicacion}` : ''}
          </p>

          <button
            onClick={logout}
            className="mt-4 w-full rounded-xl bg-red-500 px-4 py-2 text-sm font-medium hover:bg-red-400"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}