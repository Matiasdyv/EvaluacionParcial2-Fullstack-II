// Sesión del administrador (simulada con localStorage, igual que el resto de la app).
// Las cuentas de administrador viven en este archivo; no se pueden registrar desde la web.

const CLAVE_SESION_ADMIN = 'st_sesion_admin'

const ADMINISTRADORES = [
  { id: 'ADM001', nombre: 'Administrador', email: 'admin@duoc.cl', password: 'admin123' },
]

// Nunca se entrega la contraseña al resto de la app.
const datosPublicos = ({ id, nombre, email }) => ({ id, nombre, email })

export const iniciarSesionAdmin = (email, password) => {
  const admin = ADMINISTRADORES.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
  )
  if (!admin) {
    return { ok: false, error: 'Correo o contraseña incorrectos.' }
  }
  localStorage.setItem(CLAVE_SESION_ADMIN, JSON.stringify(admin.id))
  return { ok: true, admin: datosPublicos(admin) }
}

export const cerrarSesionAdmin = () => localStorage.removeItem(CLAVE_SESION_ADMIN)

export const obtenerAdminActual = () => {
  try {
    const id = JSON.parse(localStorage.getItem(CLAVE_SESION_ADMIN))
    const admin = ADMINISTRADORES.find((a) => a.id === id)
    return admin ? datosPublicos(admin) : null
  } catch {
    return null
  }
}
