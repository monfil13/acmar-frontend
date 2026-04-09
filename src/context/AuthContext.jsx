import { useMemo, useState } from 'react'
import { AuthContext } from './auth-context'

function decodeJwt(token) {
  try {
    const t = String(token || '').trim()
    const parts = t.split('.')
    if (parts.length !== 3) return null

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

function readUserFromStorage() {
  const stored = localStorage.getItem('user')
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

function userFromToken(token) {
  const p = decodeJwt(token)
  if (!p?.id || !p?.email) return null
  return {
    id: p.id,
    email: p.email,
    rol: p.rol,
    ubicacion: p.ubicacion,
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [userStored, setUserStored] = useState(() => readUserFromStorage())

  // Usuario efectivo (si storage no trae user, lo sacamos del token)
  const user = useMemo(() => {
    return userStored || userFromToken(token)
  }, [userStored, token])

  // Si pudimos reconstruir user desde token pero storage estaba vacío, lo persistimos
  if (token && user && !userStored) {
    localStorage.setItem('user', JSON.stringify(user))
    // No hacemos setState aquí; no es necesario para mostrarlo.
  }

  const login = ({ token, user }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token)
    setUserStored(user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken('')
    setUserStored(null)
  }

  const value = useMemo(() => {
    return {
      token,
      user,
      isAuthenticated: !!token,
      login,
      logout,
    }
  }, [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}