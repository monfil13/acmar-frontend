import axios from 'axios'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000'

console.log("API_URL:", API_URL)

const client = axios.create({
  baseURL: API_URL,
})

/** =========================
 * REQUEST (envía token)
 * ========================= */
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  console.log('🔐 Token enviado:', token)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

/** =========================
 * RESPONSE (manejo errores)
 * ========================= */
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⛔ Token inválido o expirado')

      localStorage.removeItem('token')

      // redirige al login automáticamente
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default client