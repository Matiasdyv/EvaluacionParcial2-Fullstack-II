import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { obtenerUsuarios, registrarUsuario } from '../data/db'

const abrir = (ruta = '/registro') =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>
  )

// Cambia el valor de un campo (más rápido que escribir letra por letra).
const poner = (etiqueta, valor) =>
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })

const llenar = async (user, datos = {}) => {
  const v = {
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
    telefono: '+56 9 1234 5678',
    password: 'clave123',
    confirmarPassword: 'clave123',
    ...datos,
  }
  poner('Nombre', v.nombre)
  poner('Apellido paterno', v.apellidoPaterno)
  poner('Apellido materno', v.apellidoMaterno)
  poner('Fecha de nacimiento', v.fechaNacimiento)
  poner('RUT', v.rut)
  poner('Número de documento', v.nroDocumento)
  poner('Seguro médico', v.seguro)
  poner('Género', v.genero)
  poner('Región', v.region)
  poner('Dirección', v.direccion)
  poner('Correo electrónico', v.email)
  poner('Teléfono', v.telefono)
  poner('Contraseña', v.password)
  poner('Confirmar contraseña', v.confirmarPassword)
  await user.click(screen.getByLabelText(/acepto los términos/i))
}

const enviar = (user) => user.click(screen.getByRole('button', { name: 'Registrarme' }))

describe('Registro', () => {
  beforeEach(() => localStorage.clear())

  it('muestra el formulario de registro', () => {
    abrir()
    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument()
    expect(screen.getByLabelText('RUT')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Registrarme' })).toBeInTheDocument()
  })

  it('al enviar vacío muestra los errores y no guarda nada', async () => {
    const user = userEvent.setup()
    abrir()
    await enviar(user)
    expect(screen.getByText('El nombre no puede estar vacío.')).toBeInTheDocument()
    expect(screen.getByText('El RUT no puede estar vacío.')).toBeInTheDocument()
    expect(screen.getByText('Selecciona un seguro médico.')).toBeInTheDocument()
    expect(screen.getByText('Debes aceptar los términos y condiciones.')).toBeInTheDocument()
    expect(obtenerUsuarios()).toHaveLength(0)
  })

  it('muestra el error al salir del campo, sin enviar el formulario', async () => {
    const user = userEvent.setup()
    abrir()
    await user.type(screen.getByLabelText('Correo electrónico'), 'esto-no-es-un-correo')
    expect(screen.queryByText('Ingresa un correo electrónico válido.')).not.toBeInTheDocument()
    await user.tab()
    expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeInTheDocument()
  })

  it('rechaza un RUT con dígito verificador incorrecto', async () => {
    const user = userEvent.setup()
    abrir()
    await llenar(user, { rut: '12345678-9' })
    await enviar(user)
    expect(screen.getByText('Ingresa un RUT válido con guion (ej: 12345678-5).')).toBeInTheDocument()
    expect(obtenerUsuarios()).toHaveLength(0)
  })

  it('rechaza a un menor de 18 años', async () => {
    const user = userEvent.setup()
    abrir()
    await llenar(user, { fechaNacimiento: '2020-01-01' })
    await enviar(user)
    expect(screen.getByText('Debes ser mayor de 18 años para registrarte.')).toBeInTheDocument()
    expect(obtenerUsuarios()).toHaveLength(0)
  })

  it('rechaza contraseñas que no coinciden', async () => {
    const user = userEvent.setup()
    abrir()
    await llenar(user, { confirmarPassword: 'otraclave1' })
    await enviar(user)
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument()
    expect(obtenerUsuarios()).toHaveLength(0)
  })

  it('rechaza documento, teléfono y contraseña con formato inválido', async () => {
    const user = userEvent.setup()
    abrir()
    await llenar(user, {
      nroDocumento: '123',
      telefono: '12345',
      password: '123',
      confirmarPassword: '123',
    })
    await enviar(user)
    expect(screen.getByText('Debe tener entre 8 y 10 caracteres (sin puntos ni guiones).')).toBeInTheDocument()
    expect(screen.getByText('Ingresa un teléfono válido (ej: +56 9 1234 5678).')).toBeInTheDocument()
    expect(screen.getByText('La contraseña debe tener al menos 6 caracteres.')).toBeInTheDocument()
    expect(obtenerUsuarios()).toHaveLength(0)
  })

  it('con datos válidos guarda el usuario y muestra la confirmación', async () => {
    const user = userEvent.setup()
    abrir()
    await llenar(user)
    await enviar(user)
    expect(screen.getByText('¡Cuenta creada!')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir a iniciar sesión' })).toHaveAttribute('href', '/login')

    const usuarios = obtenerUsuarios()
    expect(usuarios).toHaveLength(1)
    expect(usuarios[0]).toMatchObject({
      rut: '12345678-5',
      email: 'ana@correo.cl',
      telefono: '+56912345678',
      seguro: 'fonasa',
    })
    expect(usuarios[0]).not.toHaveProperty('confirmarPassword')
  })

  it('no permite registrar dos veces el mismo RUT', async () => {
    const user = userEvent.setup()
    registrarUsuario({ nombre: 'Otro', rut: '12345678-5', email: 'otro@correo.cl', password: 'x' })
    abrir()
    await llenar(user)
    await enviar(user)
    expect(screen.getByText('Ya existe una cuenta con ese RUT.')).toBeInTheDocument()
    expect(obtenerUsuarios()).toHaveLength(1)
  })

  it('el menú tiene el enlace "Registro"', async () => {
    const user = userEvent.setup()
    abrir('/')
    await user.click(screen.getByRole('link', { name: 'Registro' }))
    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument()
  })
})