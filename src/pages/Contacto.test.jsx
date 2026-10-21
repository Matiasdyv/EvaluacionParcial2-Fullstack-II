import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { obtenerMensajes } from '../data/db'

const abrir = (ruta = '/contacto') =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>
  )

const llenar = async (user, datos = {}) => {
  const v = {
    nombre: 'Ana Torres',
    email: 'ana@correo.cl',
    telefono: '+56 9 1234 5678',
    asunto: 'consulta',
    mensaje: 'Quiero saber los horarios de atención.',
    ...datos,
  }
  await user.type(screen.getByLabelText('Nombre completo'), v.nombre)
  await user.type(screen.getByLabelText('Correo electrónico'), v.email)
  await user.type(screen.getByLabelText('Teléfono de contacto'), v.telefono)
  if (v.asunto) await user.selectOptions(screen.getByLabelText('Motivo de contacto'), v.asunto)
  await user.type(screen.getByLabelText('Mensaje'), v.mensaje)
}

const enviar = (user) => user.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

describe('Contacto', () => {
  beforeEach(() => localStorage.clear())

  it('muestra el formulario y la información de atención', () => {
    abrir()
    expect(screen.getByRole('heading', { name: 'Contacto' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument()
    expect(screen.getByLabelText('Motivo de contacto')).toBeInTheDocument()
    expect(screen.getByText(/Av\. Providencia 1234/)).toBeInTheDocument()
  })

  it('al enviar vacío muestra los 5 errores y no guarda nada', async () => {
    const user = userEvent.setup()
    abrir()
    await enviar(user)
    expect(screen.getByText('El nombre no puede estar vacío.')).toBeInTheDocument()
    expect(screen.getByText('El correo electrónico no puede estar vacío.')).toBeInTheDocument()
    expect(screen.getByText('El teléfono no puede estar vacío.')).toBeInTheDocument()
    expect(screen.getByText('Selecciona un motivo de contacto.')).toBeInTheDocument()
    expect(screen.getByText('El mensaje no puede estar vacío.')).toBeInTheDocument()
    expect(obtenerMensajes()).toHaveLength(3)
  })

  it('rechaza correo, teléfono y mensaje con formato inválido', async () => {
    const user = userEvent.setup()
    abrir()
    await llenar(user, { nombre: 'Al', email: 'ana@correo', telefono: '12345', mensaje: 'Hola' })
    await enviar(user)
    expect(screen.getByText('Ingresa tu nombre completo.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeInTheDocument()
    expect(screen.getByText(/Ingresa un teléfono válido/)).toBeInTheDocument()
    expect(screen.getByText('Tu mensaje debe tener al menos 10 caracteres.')).toBeInTheDocument()
  })

  it('muestra el error al salir del campo, sin enviar el formulario', async () => {
    const user = userEvent.setup()
    abrir()
    await user.type(screen.getByLabelText('Correo electrónico'), 'esto-no-es-un-correo')
    expect(screen.queryByText('Ingresa un correo electrónico válido.')).not.toBeInTheDocument()
    await user.tab()
    expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeInTheDocument()
  })

  it('el error desaparece solo cuando el usuario corrige el campo', async () => {
    const user = userEvent.setup()
    abrir()
    await enviar(user)
    expect(screen.getByText('El nombre no puede estar vacío.')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Torres')
    expect(screen.queryByText('El nombre no puede estar vacío.')).not.toBeInTheDocument()
    expect(screen.getByText('El correo electrónico no puede estar vacío.')).toBeInTheDocument()
  })

  it('con datos válidos guarda el mensaje como Pendiente y muestra la confirmación', async () => {
    const user = userEvent.setup()
    abrir()
    await llenar(user)
    await enviar(user)
    expect(screen.getByText('¡Mensaje enviado!')).toBeInTheDocument()
    expect(screen.getByText(/ana@correo\.cl/)).toBeInTheDocument()
    const guardados = obtenerMensajes()
    expect(guardados).toHaveLength(4)
    const nuevo = guardados[3]
    expect(nuevo).toMatchObject({
      paciente: 'Ana Torres',
      email: 'ana@correo.cl',
      telefono: '+56 9 1234 5678',
      asunto: 'Consulta general',
      motivo: 'Quiero saber los horarios de atención.',
      estado: 'Pendiente',
    })
    expect(nuevo.fecha).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })

  it('"Enviar otro mensaje" vuelve a mostrar el formulario vacío', async () => {
    const user = userEvent.setup()
    abrir()
    await llenar(user)
    await enviar(user)
    await user.click(screen.getByRole('button', { name: 'Enviar otro mensaje' }))
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('')
    expect(screen.queryByText('El nombre no puede estar vacío.')).not.toBeInTheDocument()
  })

  it('el menú tiene el enlace "Contacto"', async () => {
    const user = userEvent.setup()
    abrir('/')
    await user.click(screen.getByRole('link', { name: 'Contacto' }))
    expect(screen.getByRole('heading', { name: 'Contacto' })).toBeInTheDocument()
  })
})
