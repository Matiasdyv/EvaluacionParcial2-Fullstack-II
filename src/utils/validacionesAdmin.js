// Validaciones del área de administración (sin React, fáciles de probar).

export const esCorreoAdminValido = (correo) =>
  /^[a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/.test(correo.trim())

// Devuelve un mensaje por cada campo con problemas del inicio de sesión del administrador.
export function validarLoginAdmin({ correo, password }) {
  const errores = {}

  const c = correo.trim()
  if (c === '') errores.correo = 'El correo es obligatorio.'
  else if (c.length > 100) errores.correo = 'Máximo 100 caracteres permitidos.'
  else if (!esCorreoAdminValido(c)) errores.correo = 'Debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com.'

  if (password === '') errores.password = 'La contraseña es obligatoria.'
  else if (password.length < 4 || password.length > 10) {
    errores.password = 'La contraseña debe tener entre 4 y 10 caracteres.'
  }

  return errores
}

export const PRECIO_MINIMO = 1000
export const PRECIO_MAXIMO = 1000000

// Valida el valor de una consulta escrito por el administrador. Devuelve un mensaje o ''.
export function validarPrecio(texto) {
  const valor = String(texto).trim()
  if (valor === '') return 'Ingresa un valor.'
  const numero = Number(valor)
  if (!Number.isInteger(numero)) return 'El valor debe ser un número entero, sin decimales.'
  if (numero < PRECIO_MINIMO || numero > PRECIO_MAXIMO) {
    return 'El valor debe estar entre $1.000 y $1.000.000.'
  }
  return ''
}
