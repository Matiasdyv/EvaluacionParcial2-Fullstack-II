import { describe, it, expect } from 'vitest'
import {
  construirCsv,
  contarPorEstado,
  filtrarCitas,
  ingresoDeCita,
  ingresoTotal,
  resumenPorEspecialidad,
  valorDeCita,
} from './informes'

const medicos = [
  { id: 'ESP001', especialidad: 'Medicina General', nombre: 'Dra. María Pérez', precio: 30000 },
  { id: 'ESP002', especialidad: 'Pediatría', nombre: 'Dr. Juan López', precio: 20000 },
  { id: 'ESP003', especialidad: 'Ginecología', nombre: 'Dra. Ana González' },
]

const cita = (id, extra) => ({
  id,
  especialidad: 'Pediatría',
  medico: 'Dr. Juan López',
  fecha: '2026-11-02',
  hora: '10:00',
  observaciones: 'Control',
  estado: 'Confirmada',
  ...extra,
})

const citas = [
  cita('A', { estado: 'Confirmada', fecha: '2026-11-02' }),
  cita('B', { estado: 'Atendida', fecha: '2026-11-03' }),
  cita('C', { estado: 'Cancelada', fecha: '2026-11-04', especialidad: 'Medicina General', medico: 'Dra. María Pérez' }),
  cita('D', { estado: 'Solicitada', fecha: '2026-12-01', especialidad: 'Medicina General', medico: 'Dra. María Pérez' }),
]

describe('filtrarCitas', () => {
  it('sin filtros devuelve todas las citas', () => {
    expect(filtrarCitas(citas)).toHaveLength(4)
    expect(filtrarCitas(citas, {})).toHaveLength(4)
  })

  it('filtra por estado y por especialidad', () => {
    expect(filtrarCitas(citas, { estado: 'Atendida' }).map((c) => c.id)).toEqual(['B'])
    expect(filtrarCitas(citas, { especialidad: 'Medicina General' }).map((c) => c.id)).toEqual(['C', 'D'])
  })

  it('filtra por rango de fechas con los extremos incluidos', () => {
    expect(filtrarCitas(citas, { desde: '2026-11-03', hasta: '2026-11-04' }).map((c) => c.id)).toEqual(['B', 'C'])
    expect(filtrarCitas(citas, { desde: '2026-12-01' }).map((c) => c.id)).toEqual(['D'])
    expect(filtrarCitas(citas, { hasta: '2026-11-02' }).map((c) => c.id)).toEqual(['A'])
  })

  it('combina todos los filtros', () => {
    expect(filtrarCitas(citas, { estado: 'Cancelada', especialidad: 'Pediatría' })).toEqual([])
  })
})

describe('conteos e ingresos', () => {
  it('contarPorEstado cuenta cada estado presente', () => {
    expect(contarPorEstado([...citas, cita('E', { estado: 'Confirmada' })])).toEqual({
      Confirmada: 2,
      Atendida: 1,
      Cancelada: 1,
      Solicitada: 1,
    })
  })

  it('el valor de la cita sale del médico; sin precio vale 0', () => {
    expect(valorDeCita(citas[0], medicos)).toBe(20000)
    expect(valorDeCita(cita('X', { medico: 'Dra. Ana González' }), medicos)).toBe(0)
    expect(valorDeCita(cita('Y', { medico: 'Médico que no existe' }), medicos)).toBe(0)
  })

  it('solo las citas confirmadas y atendidas generan ingreso', () => {
    expect(ingresoDeCita(citas[0], medicos)).toBe(20000)
    expect(ingresoDeCita(citas[1], medicos)).toBe(20000)
    expect(ingresoDeCita(citas[2], medicos)).toBe(0)
    expect(ingresoDeCita(citas[3], medicos)).toBe(0)
    expect(ingresoTotal(citas, medicos)).toBe(40000)
  })

  it('resumenPorEspecialidad agrupa y ordena por nombre', () => {
    expect(resumenPorEspecialidad(citas, medicos)).toEqual([
      { especialidad: 'Medicina General', total: 2, ingreso: 0 },
      { especialidad: 'Pediatría', total: 2, ingreso: 40000 },
    ])
    expect(resumenPorEspecialidad([], medicos)).toEqual([])
  })
})

describe('construirCsv', () => {
  it('arma el encabezado y una fila por cita', () => {
    const filas = construirCsv([citas[0]], medicos).split('\n')
    expect(filas).toHaveLength(2)
    expect(filas[0]).toBe('"Código","Fecha","Hora","Especialidad","Médico","Estado","Motivo","Valor"')
    expect(filas[1]).toBe('"A","2026-11-02","10:00","Pediatría","Dr. Juan López","Confirmada","Control","20000"')
  })

  it('protege las comillas y las comas del texto', () => {
    const csv = construirCsv([cita('Q', { observaciones: 'Dijo "hola", y se fue' })], medicos)
    expect(csv).toContain('"Dijo ""hola"", y se fue"')
  })

  it('sin citas deja solo el encabezado', () => {
    expect(construirCsv([]).split('\n')).toHaveLength(1)
  })
})
