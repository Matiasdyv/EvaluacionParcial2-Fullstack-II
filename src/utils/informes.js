// Cálculos del informe de citas (sin React, fáciles de probar).

// Estados de cita que generan ingreso: la cita se realizó o se va a realizar.
export const ESTADOS_CON_INGRESO = ['Confirmada', 'Atendida']

// Aplica los filtros del informe. Las fechas vienen como AAAA-MM-DD, así que se pueden comparar como texto.
export function filtrarCitas(citas, { estado = '', especialidad = '', desde = '', hasta = '' } = {}) {
  return citas.filter(
    (c) =>
      (estado === '' || c.estado === estado) &&
      (especialidad === '' || c.especialidad === especialidad) &&
      (desde === '' || c.fecha >= desde) &&
      (hasta === '' || c.fecha <= hasta)
  )
}

// { Solicitada: 2, Confirmada: 1, ... } — solo aparecen los estados que existen en la lista.
export function contarPorEstado(citas) {
  return citas.reduce((cuenta, c) => ({ ...cuenta, [c.estado]: (cuenta[c.estado] ?? 0) + 1 }), {})
}

// La cita guarda el nombre del médico, así que el valor se busca por nombre.
export const valorDeCita = (cita, medicos) =>
  medicos.find((m) => m.nombre === cita.medico)?.precio ?? 0

export const ingresoDeCita = (cita, medicos) =>
  ESTADOS_CON_INGRESO.includes(cita.estado) ? valorDeCita(cita, medicos) : 0

export const ingresoTotal = (citas, medicos) =>
  citas.reduce((suma, c) => suma + ingresoDeCita(c, medicos), 0)

// Una fila por especialidad: cuántas citas tiene y cuánto ingreso estimado genera.
export function resumenPorEspecialidad(citas, medicos) {
  const filas = {}
  for (const c of citas) {
    const fila = filas[c.especialidad] ?? { especialidad: c.especialidad, total: 0, ingreso: 0 }
    fila.total += 1
    fila.ingreso += ingresoDeCita(c, medicos)
    filas[c.especialidad] = fila
  }
  return Object.values(filas).sort((a, b) => a.especialidad.localeCompare(b.especialidad))
}

const celdaCsv = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`

// Texto CSV (separado por comas) con las citas del informe.
export function construirCsv(citas, medicos = []) {
  const encabezado = ['Código', 'Fecha', 'Hora', 'Especialidad', 'Médico', 'Estado', 'Motivo', 'Valor']
  const filas = citas.map((c) =>
    [c.id, c.fecha, c.hora, c.especialidad, c.medico, c.estado, c.observaciones, valorDeCita(c, medicos)]
      .map(celdaCsv)
      .join(',')
  )
  return [encabezado.map(celdaCsv).join(','), ...filas].join('\n')
}
