import { createContext, useContext, useEffect, useState } from 'react'
import api from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  })
  const [loading, setLoading] = useState(!!localStorage.getItem('token'))

  useEffect(() => {
    if (!localStorage.getItem('token')) return
    api.get('/me')
      .then((r) => { setUser(r.data); localStorage.setItem('user', JSON.stringify(r.data)) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const logout = async () => {
    try { await api.post('/logout') } catch { /* token déjà invalide */ }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
