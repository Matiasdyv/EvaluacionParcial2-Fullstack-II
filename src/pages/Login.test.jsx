import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { iniciarSesion, obtenerUsuarioActual, registrarUsuario } from '../data/db'

const USUARIO = {
  nombre: 'Ana',
  apellidoPaterno: 'Torres',
  apellidoMaterno: 'Rojas',
  fechaNacimiento: '2000-01-15',
  rut: '12345678-5',
  nroDocumento: '123456789',
  seguro: 'fonasa',
  genero: 'femenino',
  region: 'Metropolitana de Santiago',
  direccion: 'Calle 1 #123',
  email: 'ana@correo.cl',
  telefono: '+56912345678',
  password: 'clave123',
}

const abrir = (ruta = '/login') =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>
  )

const ingresar = async (user, rut, password) => {
  await user.type(screen.getByLabelText('RUT'), rut)
  await user.type(screen.getByLabelText('Contraseña'), password)
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))
}

describe('Login', () => {
  beforeEach(() => localStorage.clear())

  it('al enviar vacío muestra los dos errores', async () => {
    const user = userEvent.setup()
    abrir()
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(screen.getByText('Debes ingresar tu RUT.')).toBeInTheDocument()
    expect(screen.getByText('La contraseña no puede estar vacía.')).toBeInTheDocument()
  })

  it('rechaza un RUT con dígito verificador incorrecto', async () => {
    const user = userEvent.setup()
    abrir()
    await ingresar(user, '12345678-9', 'clave123')
    expect(screen.getByText('Ingresa un RUT válido con guion (ej: 12345678-5).')).toBeInTheDocument()
  })

  it('con credenciales incorrectas muestra un error y no inicia sesión', async () => {
    const user = userEvent.setup()
    registrarUsuario(USUARIO)
    abrir()
    await ingresar(user, '12345678-5', 'otraclave')
    expect(screen.getByText('RUT o contraseña incorrectos.')).toBeInTheDocument()
    expect(obtenerUsuarioActual()).toBeNull()
  })

  it('con credenciales correctas inicia sesión y vuelve al inicio', async () => {
    const user = userEvent.setup()
    registrarUsuario(USUARIO)
    abrir()
    await ingresar(user, '12345678-5', 'clave123')
    expect(screen.getByRole('heading', { name: 'Bienvenido a SaludTotal' })).toBeInTheDocument()
    expect(screen.getByText('Hola, Ana')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
    expect(obtenerUsuarioActual().rut).toBe('12345678-5')
  })

  it('acepta el RUT escrito con puntos', async () => {
    const user = userEvent.setup()
    registrarUsuario(USUARIO)
    abrir()
    await ingresar(user, '12.345.678-5', 'clave123')
    expect(screen.getByText('Hola, Ana')).toBeInTheDocument()
  })

  it('cerrar sesión quita el saludo y vuelve a mostrar "Iniciar sesión"', async () => {
    const user = userEvent.setup()
    registrarUsuario(USUARIO)
    abrir()
    await ingresar(user, '12345678-5', 'clave123')
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(screen.queryByText('Hola, Ana')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(obtenerUsuarioActual()).toBeNull()
  })

  it('la sesión se mantiene al volver a abrir la aplicación', () => {
    registrarUsuario(USUARIO)
    iniciarSesion('12345678-5', 'clave123')
    abrir('/')
    expect(screen.getByText('Hola, Ana')).toBeInTheDocument()
  })

  it('el enlace "Regístrate aquí" lleva al registro', async () => {
    const user = userEvent.setup()
    abrir()
    await user.click(screen.getByRole('link', { name: 'Regístrate aquí' }))
    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument()
  })
})