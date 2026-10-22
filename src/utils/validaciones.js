// Funciones de validación reutilizables (sin React, fáciles de probar).

export const normalizarRut = (rut) => rut.trim().replace(/\./g, '').toUpperCase()

export function esRutValido(rut) {
  const limpio = normalizarRut(rut)
  if (!/^\d{7,8}-[\dK]$/.test(limpio)) return false

  const [cuerpo, dv] = limpio.split('-')
  let suma = 0
  let multiplicador = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }
  const resto = 11 - (suma % 11)
  const esperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto)
  return dv === esperado
}

export const esEmailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

export const esTelefonoValido = (telefono) =>
  /^(\+?56)?9\d{8}$/.test(telefono.replace(/\s/g, ''))

// Edad en años cumplidos a la fecha "hoy". La fecha viene como AAAA-MM-DD.
export function calcularEdad(fechaISO, hoy = new Date()) {
  const [anio, mes, dia] = fechaISO.split('-').map(Number)
  let edad = hoy.getFullYear() - anio
  const mesActual = hoy.getMonth() + 1
  if (mesActual < mes || (mesActual === mes && hoy.getDate() < dia)) edad--
  return edad
}