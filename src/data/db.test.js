import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  actualizarCita,
  actualizarMedico,
  actualizarMensaje,
  cerrarSesion,
  crearCita,
  crearMedico,
  crearMensaje,
  eliminarCita,
  eliminarMedico,
  eliminarMensaje,
  iniciarSesion,
  obtenerCitas,
  obtenerMedico,
  obtenerMedicos,
  obtenerMensajes,
  obtenerUsuarioActual,
  obtenerUsuarios,
  registrarUsuario,
} from './db'

const cita = { medico: 'Dr. Juan López', fecha: '2026-11-02', hora: '09:00' }
const usuario = { nombre: 'Ana', rut: '12345678-5', email: 'ana@correo.cl', password: 'clave123' }

describe('db.js', () => {
  beforeEach(() => localStorage.clear())

  it('trae los 5 médicos iniciales', () => {
    expect(obtenerMedicos()).toHaveLength(5)
  })

  it('busca un médico por id', () => {
    expect(obtenerMedico('ESP002').nombre).toBe('Dr. Juan López')
  })

  it('crea una cita con estado Solicitada', () => {
    const resultado = crearCita(cita)
    expect(resultado.ok).toBe(true)
    expect(resultado.cita.estado).toBe('Solicitada')
  })

  it('rechaza una doble reserva', () => {
    crearCita(cita)
    const segunda = crearCita(cita)
    expect(segunda.ok).toBe(false)
    expect(segunda.error).toBe('Ese horario ya está reservado.')
  })

  it('libera el horario al cancelar la cita', () => {
    const { cita: creada } = crearCita(cita)
    actualizarCita(creada.id, { estado: 'Cancelada' })
    expect(crearCita(cita).ok).toBe(true)
  })

  it('crea un mensaje Pendiente aunque se pase otro estado', () => {
    expect(crearMensaje({ paciente: 'Ana', estado: 'Respondido' }).estado).toBe('Pendiente')
  })
})

describe('db.js - usuarios y sesión', () => {
  beforeEach(() => localStorage.clear())

  it('registra un usuario nuevo', () => {
    const resultado = registrarUsuario(usuario)
    expect(resultado.ok).toBe(true)
    expect(obtenerUsuarios()).toHaveLength(1)
  })

  it('rechaza un RUT repetido', () => {
    registrarUsuario(usuario)
    const resultado = registrarUsuario({ ...usuario, email: 'otro@correo.cl' })
    expect(resultado.ok).toBe(false)
    expect(resultado.error).toBe('Ya existe una cuenta con ese RUT.')
  })

  it('rechaza un correo repetido aunque cambien las mayúsculas', () => {
    registrarUsuario(usuario)
    const resultado = registrarUsuario({ ...usuario, rut: '11111111-1', email: 'ANA@correo.cl' })
    expect(resultado.ok).toBe(false)
    expect(resultado.error).toBe('Ya existe una cuenta con ese correo.')
  })

  it('inicia sesión con credenciales correctas y guarda la sesión', () => {
    registrarUsuario(usuario)
    const resultado = iniciarSesion('12345678-5', 'clave123')
    expect(resultado.ok).toBe(true)
    expect(obtenerUsuarioActual().nombre).toBe('Ana')
  })

  it('no inicia sesión con una contraseña incorrecta', () => {
    registrarUsuario(usuario)
    const resultado = iniciarSesion('12345678-5', 'otraclave')
    expect(resultado.ok).toBe(false)
    expect(obtenerUsuarioActual()).toBeNull()
  })

  it('cerrar sesión borra la sesión guardada', () => {
    registrarUsuario(usuario)
    iniciarSesion('12345678-5', 'clave123')
    cerrarSesion()
    expect(obtenerUsuarioActual()).toBeNull()
  })

  it('si la sesión guardada está dañada, no hay usuario actual', () => {
    registrarUsuario(usuario)
    localStorage.setItem('st_sesion', 'esto-no-es-json')
    expect(obtenerUsuarioActual()).toBeNull()
  })

  it('al iniciar sesión guarda en localStorage (se verifica con un espía)', () => {
    registrarUsuario(usuario)
    const espia = vi.spyOn(Storage.prototype, 'setItem')
    iniciarSesion('12345678-5', 'clave123')
    expect(espia).toHaveBeenCalledWith('st_sesion', JSON.stringify('12345678-5'))
    espia.mockRestore()
  })
})

describe('db.js - crear, actualizar y eliminar', () => {
  beforeEach(() => localStorage.clear())

  it('elimina un médico por id', () => {
    eliminarMedico('ESP001')
    expect(obtenerMedicos()).toHaveLength(4)
  })

  it('crea y actualiza un médico', () => {
    crearMedico({
      id: 'ESP006',
      especialidad: 'Cardiología',
      nombre: 'Dr. Pablo Mena',
      horaInicio: '08:00',
      horaFin: '14:00',
      duracion: 30,
    })
    expect(obtenerMedicos()).toHaveLength(6)
    actualizarMedico('ESP006', { duracion: 45 })
    expect(obtenerMedicos().find((m) => m.id === 'ESP006').duracion).toBe(45)
  })

  it('elimina una cita', () => {
    const { cita: creada } = crearCita(cita)
    eliminarCita(creada.id)
    expect(obtenerCitas()).toHaveLength(0)
  })

  it('elimina un mensaje de contacto', () => {
    eliminarMensaje(101)
    expect(obtenerMensajes()).toHaveLength(2)
  })

  it('actualiza el estado de un mensaje de contacto', () => {
    actualizarMensaje(101, { estado: 'Respondido' })
    expect(obtenerMensajes().find((m) => m.id === 101).estado).toBe('Respondido')
  })

  it('si los datos guardados están dañados, vuelve a los datos iniciales', () => {
    localStorage.setItem('st_medicos', 'esto-no-es-json')
    expect(obtenerMedicos()).toHaveLength(5)
  })
})