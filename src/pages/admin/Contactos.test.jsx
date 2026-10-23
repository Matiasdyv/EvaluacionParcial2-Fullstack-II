import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'
import { crearMensaje, obtenerMensajes } from '../../data/db'
import { iniciarSesionAdmin } from '../../data/admin'

const abrir = () =>
  render(
    <MemoryRouter initialEntries={['/admin/contactos']}>
      <App />
    </MemoryRouter>
  )

// Filas de datos de la tabla (sin la fila del encabezado).
const filas = () => screen.getAllByRole('row').slice(1)

describe('Contactos del administrador', () => {
  beforeEach(() => {
    localStorage.clear()
    iniciarSesionAdmin('admin@duoc.cl', 'admin123')
  })

  it('lista los mensajes del más nuevo al más antiguo', () => {
    abrir()
    expect(filas()).toHaveLength(3)
    expect(filas()[0]).toHaveTextContent('Carlos Mendoza')
    expect(filas()[1]).toHaveTextContent('Andrea Silva')
    expect(filas()[2]).toHaveTextContent('Roberto Gómez')
  })

  it('busca por paciente, por doctor y por motivo', async () => {
    const user = userEvent.setup()
    abrir()
    const buscador = screen.getByLabelText('Buscar mensajes')

    await user.type(buscador, 'andrea')
    expect(filas()).toHaveLength(1)
    expect(filas()[0]).toHaveTextContent('Andrea Silva')

    await user.clear(buscador)
    await user.type(buscador, 'carlos soto')
    expect(filas()).toHaveLength(1)
    expect(filas()[0]).toHaveTextContent('Roberto Gómez')

    await user.clear(buscador)
    await user.type(buscador, 'receta')
    expect(filas()).toHaveLength(1)
    expect(filas()[0]).toHaveTextContent('Carlos Mendoza')
  })

  it('muestra un aviso cuando la búsqueda no encuentra nada', async () => {
    const user = userEvent.setup()
    abrir()
    await user.type(screen.getByLabelText('Buscar mensajes'), 'zzzz')
    expect(screen.getByText('No se encontraron mensajes.')).toBeInTheDocument()
  })

  it('filtra por estado', async () => {
    const user = userEvent.setup()
    abrir()
    await user.selectOptions(screen.getByLabelText('Filtrar por estado'), 'Pendiente')
    expect(filas()).toHaveLength(2)
    await user.selectOptions(screen.getByLabelText('Filtrar por estado'), 'Respondido')
    expect(filas()).toHaveLength(1)
    expect(filas()[0]).toHaveTextContent('Andrea Silva')
    await user.selectOptions(screen.getByLabelText('Filtrar por estado'), '')
    expect(filas()).toHaveLength(3)
  })

  it('"Ver detalle" abre el mensaje completo y se puede cerrar', async () => {
    const user = userEvent.setup()
    abrir()
    await user.click(screen.getByRole('button', { name: 'Ver detalle del mensaje 101' }))
    const ventana = screen.getByRole('dialog')
    expect(within(ventana).getByText('Mensaje #101')).toBeInTheDocument()
    expect(within(ventana).getByText('Consulta sobre dosis de receta')).toBeInTheDocument()
    await user.click(within(ventana).getByRole('button', { name: 'Cerrar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('"Marcar como respondido" cambia el estado y lo guarda', async () => {
    const user = userEvent.setup()
    abrir()
    await user.click(screen.getByRole('button', { name: 'Ver detalle del mensaje 101' }))
    await user.click(screen.getByRole('button', { name: 'Marcar como respondido' }))

    expect(obtenerMensajes().find((m) => m.id === 101).estado).toBe('Respondido')
    expect(screen.queryByRole('button', { name: 'Marcar como respondido' })).not.toBeInTheDocument()
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cerrar' }))
    expect(filas()[0]).toHaveTextContent('Respondido')
  })

  it('un mensaje de un mensaje ya respondido no ofrece el botón de responder', async () => {
    const user = userEvent.setup()
    abrir()
    await user.click(screen.getByRole('button', { name: 'Ver detalle del mensaje 102' }))
    expect(screen.queryByRole('button', { name: 'Marcar como respondido' })).not.toBeInTheDocument()
  })

  it('un mensaje enviado desde Contacto aparece primero y muestra correo, teléfono y asunto', async () => {
    const user = userEvent.setup()
    crearMensaje({
      fecha: '21/10/2026',
      paciente: 'Ana Torres',
      medico: '—',
      especialidad: '—',
      motivo: 'Quiero saber los horarios.',
      email: 'ana@correo.cl',
      telefono: '+56912345678',
      asunto: 'Consulta general',
    })
    abrir()
    expect(filas()[0]).toHaveTextContent('Ana Torres')
    await user.click(within(filas()[0]).getByRole('button', { name: /Ver detalle/ }))
    const ventana = screen.getByRole('dialog')
    expect(within(ventana).getByText('ana@correo.cl')).toBeInTheDocument()
    expect(within(ventana).getByText('+56912345678')).toBeInTheDocument()
    expect(within(ventana).getByText('Consulta general')).toBeInTheDocument()
  })
})
