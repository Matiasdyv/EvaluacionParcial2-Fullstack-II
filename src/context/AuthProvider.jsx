import { useState } from 'react'
import { AuthContext } from './auth'
import { iniciarSesion, cerrarSesion, obtenerUsuarioActual } from '../data/db'

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => obtenerUsuarioActual())

  const login = (rut, password) => {
    const resultado = iniciarSesion(rut, password)
    if (resultado.ok) setUsuario(resultado.usuario)
    return resultado
  }

  const logout = () => {
    cerrarSesion()
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}