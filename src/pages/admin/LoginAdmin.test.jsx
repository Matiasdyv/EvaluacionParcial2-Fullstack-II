import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'
import { iniciarSesionAdmin, obtenerAdminActual } from '../../data/admin'

const abrir = (ruta = '/admin/login') =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>
  )

const ingresar = (user) => user.click(screen.getByRole('button', { name: 'Ingresar' }))

describe('LoginAdmin', () => {
  beforeEach(() => localStorage.clear())

  it('muestra el formulario de acceso del administrador', () => {
    abrir()
    expect(screen.getByRole('heading', { name: 'Panel administrador' })).toBeInTheDocument()
    expect(screen.getByLabelText('Correo')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('maxlength', '10')
  })

  it('al enviar vacío pide correo y contraseña', async () => {
    const user = userEvent.setup()
    abrir()
    await ingresar(user)
    expect(screen.getByText('El correo es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('La contraseña es obligatoria.')).toBeInTheDocument()
  })

  it('rechaza un dominio no permitido y una contraseña corta', async () => {
    const user = userEvent.setup()
    abrir()
    await user.type(screen.getByLabelText('Correo'), 'ana@hotmail.com')
    await user.type(screen.getByLabelText('Contraseña'), 'abc')
    await ingresar(user)
    expect(screen.getByText('Debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com.')).toBeInTheDocument()
    expect(screen.getByText('La contraseña debe tener entre 4 y 10 caracteres.')).toBeInTheDocument()
    expect(obtenerAdminActual()).toBeNull()
  })

  it('el error desaparece solo cuando se corrige el campo', async () => {
    const user = userEvent.setup()
    abrir()
    await ingresar(user)
    expect(screen.getByText('El correo es obligatorio.')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Correo'), 'admin@duoc.cl')
    expect(screen.queryByText('El correo es obligatorio.')).not.toBeInTheDocument()
  })

  it('con credenciales que no existen muestra una alerta', async () => {
    const user = userEvent.setup()
    abrir()
    await user.type(screen.getByLabelText('Correo'), 'otro@duoc.cl')
    await user.type(screen.getByLabelText('Contraseña'), 'clave123')
    await ingresar(user)
    expect(screen.getByText('Correo o contraseña incorrectos.')).toBeInTheDocument()
    expect(obtenerAdminActual()).toBeNull()
  })

  it('con credenciales correctas entra al panel de administración', async () => {
    const user = userEvent.setup()
    abrir()
    await user.type(screen.getByLabelText('Correo'), 'admin@duoc.cl')
    await user.type(screen.getByLabelText('Contraseña'), 'admin123')
    await ingresar(user)
    expect(screen.getByRole('heading', { name: '¡Hola, Administrador!' })).toBeInTheDocument()
    expect(obtenerAdminActual()).not.toBeNull()
  })

  it('si ya hay sesión de administrador, /admin/login lleva directo al panel', () => {
    iniciarSesionAdmin('admin@duoc.cl', 'admin123')
    abrir()
    expect(screen.getByRole('heading', { name: '¡Hola, Administrador!' })).toBeInTheDocument()
  })
})
