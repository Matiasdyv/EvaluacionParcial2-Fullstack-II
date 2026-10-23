import { useState } from 'react'
import { AuthContext } from './auth'
import { iniciarSesion, cerrarSesion, obtenerUsuarioActual } from '../data/db'
import { iniciarSesionAdmin, cerrarSesionAdmin, obtenerAdminActual } from '../data/admin'

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => obtenerUsuarioActual())
  const [admin, setAdmin] = useState(() => obtenerAdminActual())

  const login = (rut, password) => {
    const resultado = iniciarSesion(rut, password)
    if (resultado.ok) setUsuario(resultado.usuario)
    return resultado
  }

  const logout = () => {
    cerrarSesion()
    setUsuario(null)
  }

  const loginAdmin = (email, password) => {
    const resultado = iniciarSesionAdmin(email, password)
    if (resultado.ok) setAdmin(resultado.admin)
    return resultado
  }

  const logoutAdmin = () => {
    cerrarSesionAdmin()
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, admin, loginAdmin, logoutAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}