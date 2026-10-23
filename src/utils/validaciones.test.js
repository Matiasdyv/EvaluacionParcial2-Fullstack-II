import { describe, it, expect } from 'vitest'
import {
  calcularEdad,
  esEmailValido,
  esRutValido,
  esTelefonoValido,
  normalizarRut,
} from './validaciones'

describe('validaciones', () => {
  it('acepta un RUT con dígito verificador correcto', () => {
    expect(esRutValido('12345678-5')).toBe(true)
    expect(esRutValido('11111111-1')).toBe(true)
  })

  it('acepta un RUT con puntos y los ignora', () => {
    expect(esRutValido('12.345.678-5')).toBe(true)
  })

  it('rechaza un RUT con dígito incorrecto o formato inválido', () => {
    expect(esRutValido('12345678-9')).toBe(false)
    expect(esRutValido('12345678')).toBe(false)
    expect(esRutValido('123')).toBe(false)
  })

  it('acepta RUT con dígito verificador 0 y K', () => {
    expect(esRutValido('12345675-0')).toBe(true)
    expect(esRutValido('12345670-K')).toBe(true)
    expect(esRutValido('12345670-k')).toBe(true)
  })

  it('normaliza el RUT quitando puntos y pasando la K a mayúscula', () => {
    expect(normalizarRut(' 12.345.678-k ')).toBe('12345678-K')
  })

  it('valida el formato del correo', () => {
    expect(esEmailValido('ana@correo.cl')).toBe(true)
    expect(esEmailValido('ana@correo')).toBe(false)
    expect(esEmailValido('ana correo.cl')).toBe(false)
  })

  it('valida teléfonos chilenos con o sin +56 y con espacios', () => {
    expect(esTelefonoValido('+56 9 1234 5678')).toBe(true)
    expect(esTelefonoValido('912345678')).toBe(true)
    expect(esTelefonoValido('12345')).toBe(false)
  })

  it('calcula la edad según si ya cumplió años este año', () => {
    const hoy = new Date(2026, 5, 15) // 15 de junio de 2026
    expect(calcularEdad('2000-06-15', hoy)).toBe(26)
    expect(calcularEdad('2000-06-16', hoy)).toBe(25)
  })
})