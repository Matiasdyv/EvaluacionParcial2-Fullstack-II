import { describe, it, expect, beforeEach } from 'vitest'
import { cerrarSesionAdmin, iniciarSesionAdmin, obtenerAdminActual } from './admin'

describe('sesión del administrador', () => {
  beforeEach(() => localStorage.clear())

  it('sin iniciar sesión no hay administrador actual', () => {
    expect(obtenerAdminActual()).toBeNull()
  })

  it('con correo y contraseña correctos inicia sesión y no entrega la contraseña', () => {
    const resultado = iniciarSesionAdmin('admin@duoc.cl', 'admin123')
    expect(resultado.ok).toBe(true)
    expect(resultado.admin).toEqual({ id: 'ADM001', nombre: 'Administrador', email: 'admin@duoc.cl' })
    expect(obtenerAdminActual()).toEqual(resultado.admin)
  })

  it('el correo no distingue mayúsculas ni espacios al borde', () => {
    expect(iniciarSesionAdmin('  ADMIN@duoc.cl ', 'admin123').ok).toBe(true)
  })

  it('con datos incorrectos rechaza el ingreso y no crea sesión', () => {
    expect(iniciarSesionAdmin('admin@duoc.cl', 'otra')).toEqual({
      ok: false,
      error: 'Correo o contraseña incorrectos.',
    })
    expect(iniciarSesionAdmin('otro@duoc.cl', 'admin123').ok).toBe(false)
    expect(obtenerAdminActual()).toBeNull()
  })

  it('cerrar sesión elimina al administrador actual', () => {
    iniciarSesionAdmin('admin@duoc.cl', 'admin123')
    cerrarSesionAdmin()
    expect(obtenerAdminActual()).toBeNull()
  })

  it('una sesión guardada con datos dañados se ignora', () => {
    localStorage.setItem('st_sesion_admin', '{no es json')
    expect(obtenerAdminActual()).toBeNull()
    localStorage.setItem('st_sesion_admin', JSON.stringify('ADM999'))
    expect(obtenerAdminActual()).toBeNull()
  })
})
