import { describe, it, expect } from 'vitest'
import { esCorreoAdminValido, validarLoginAdmin, validarPrecio } from './validacionesAdmin'

describe('esCorreoAdminValido', () => {
  it('acepta los tres dominios permitidos', () => {
    expect(esCorreoAdminValido('admin@duoc.cl')).toBe(true)
    expect(esCorreoAdminValido('ana.perez@profesor.duoc.cl')).toBe(true)
    expect(esCorreoAdminValido('ana_perez+1@gmail.com')).toBe(true)
  })

  it('rechaza otros dominios y formatos incorrectos', () => {
    expect(esCorreoAdminValido('ana@hotmail.com')).toBe(false)
    expect(esCorreoAdminValido('ana@duoc.cl.com')).toBe(false)
    expect(esCorreoAdminValido('ana@@duoc.cl')).toBe(false)
    expect(esCorreoAdminValido('anaduoc.cl')).toBe(false)
  })
})

describe('validarLoginAdmin', () => {
  it('con datos correctos no devuelve errores', () => {
    expect(validarLoginAdmin({ correo: 'admin@duoc.cl', password: 'abcd' })).toEqual({})
  })

  it('exige correo y contraseña', () => {
    expect(validarLoginAdmin({ correo: ' ', password: '' })).toEqual({
      correo: 'El correo es obligatorio.',
      password: 'La contraseña es obligatoria.',
    })
  })

  it('limita el correo a 100 caracteres', () => {
    const largo = 'a'.repeat(95) + '@duoc.cl'
    expect(validarLoginAdmin({ correo: largo, password: 'abcd' }).correo).toBe('Máximo 100 caracteres permitidos.')
  })

  it('exige uno de los dominios permitidos', () => {
    expect(validarLoginAdmin({ correo: 'ana@hotmail.com', password: 'abcd' }).correo).toBe(
      'Debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com.'
    )
  })

  it('la contraseña debe tener entre 4 y 10 caracteres', () => {
    const mensaje = 'La contraseña debe tener entre 4 y 10 caracteres.'
    expect(validarLoginAdmin({ correo: 'a@duoc.cl', password: 'abc' }).password).toBe(mensaje)
    expect(validarLoginAdmin({ correo: 'a@duoc.cl', password: 'a'.repeat(11) }).password).toBe(mensaje)
    expect(validarLoginAdmin({ correo: 'a@duoc.cl', password: 'abcd' }).password).toBeUndefined()
    expect(validarLoginAdmin({ correo: 'a@duoc.cl', password: 'a'.repeat(10) }).password).toBeUndefined()
  })
})

describe('validarPrecio', () => {
  it('acepta enteros entre $1.000 y $1.000.000', () => {
    expect(validarPrecio('1000')).toBe('')
    expect(validarPrecio('25000')).toBe('')
    expect(validarPrecio(1000000)).toBe('')
  })

  it('rechaza vacío, decimales y valores fuera de rango', () => {
    expect(validarPrecio('  ')).toBe('Ingresa un valor.')
    expect(validarPrecio('25000.5')).toBe('El valor debe ser un número entero, sin decimales.')
    expect(validarPrecio('abc')).toBe('El valor debe ser un número entero, sin decimales.')
    expect(validarPrecio('999')).toBe('El valor debe estar entre $1.000 y $1.000.000.')
    expect(validarPrecio('1000001')).toBe('El valor debe estar entre $1.000 y $1.000.000.')
  })
})
