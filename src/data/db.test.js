import { describe, it, expect, beforeEach } from 'vitest'
import { obtenerMedicos, obtenerMedico, crearCita, actualizarCita, crearMensaje } from './db'

const cita = { medico: 'Dr. Juan López', fecha: '2026-11-02', hora: '09:00' }

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
