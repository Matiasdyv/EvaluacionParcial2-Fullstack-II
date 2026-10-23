import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'
import { obtenerMedicos } from '../../data/db'
import { iniciarSesionAdmin } from '../../data/admin'

const abrir = () =>
  render(
    <MemoryRouter initialEntries={['/admin/costos']}>
      <App />
    </MemoryRouter>
  )

const campo = (medico) => screen.getByLabelText(`Nuevo valor para ${medico}`)
const guardar = (user, medico) => user.click(screen.getByRole('button', { name: `Guardar valor de ${medico}` }))
const precioGuardado = (id) => obtenerMedicos().find((m) => m.id === id).precio

describe('Costos del administrador', () => {
  beforeEach(() => {
    localStorage.clear()
    iniciarSesionAdmin('admin@duoc.cl', 'admin123')
  })

  it('lista a los 5 médicos con su valor "Sin definir"', () => {
    abrir()
    expect(screen.getByRole('heading', { name: 'Modificar costos' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    expect(screen.getAllByText('Sin definir')).toHaveLength(5)
  })

  it('guarda un valor válido y avisa con un mensaje', async () => {
    const user = userEvent.setup()
    abrir()
    await user.type(campo('Dra. María Pérez'), '25000')
    await guardar(user, 'Dra. María Pérez')

    expect(precioGuardado('ESP001')).toBe(25000)
    expect(screen.getByRole('status')).toHaveTextContent('Valor de Dra. María Pérez actualizado a $25.000.')
    const fila = screen.getByText('Dra. María Pérez').closest('li')
    expect(within(fila).getByText('$25.000')).toBeInTheDocument()
  })

  it('no guarda un valor vacío, con decimales o fuera de rango', async () => {
    const user = userEvent.setup()
    abrir()

    await guardar(user, 'Dr. Juan López')
    expect(screen.getByText('Ingresa un valor.')).toBeInTheDocument()

    await user.type(campo('Dr. Juan López'), '500')
    await guardar(user, 'Dr. Juan López')
    expect(screen.getByText('El valor debe estar entre $1.000 y $1.000.000.')).toBeInTheDocument()

    await user.clear(campo('Dr. Juan López'))
    await user.type(campo('Dr. Juan López'), '25000.5')
    await guardar(user, 'Dr. Juan López')
    expect(screen.getByText('El valor debe ser un número entero, sin decimales.')).toBeInTheDocument()

    expect(precioGuardado('ESP002')).toBeUndefined()
  })

  it('el error de una fila desaparece al volver a escribir', async () => {
    const user = userEvent.setup()
    abrir()
    await guardar(user, 'Dr. Juan López')
    expect(screen.getByText('Ingresa un valor.')).toBeInTheDocument()
    await user.type(campo('Dr. Juan López'), '2')
    expect(screen.queryByText('Ingresa un valor.')).not.toBeInTheDocument()
  })

  it('el nuevo valor se refleja de inmediato en el catálogo de Inicio', async () => {
    const user = userEvent.setup()
    abrir()
    await user.type(campo('Dr. Carlos Soto'), '32000')
    await guardar(user, 'Dr. Carlos Soto')

    await user.click(screen.getByRole('link', { name: 'Inicio' }))
    const tarjeta = screen.getByText('Dr. Carlos Soto').closest('.card')
    expect(within(tarjeta).getByText('$32.000')).toBeInTheDocument()
    // Los médicos sin valor definido no muestran la línea de precio.
    const otra = screen.getByText('Dra. Elena Rojas').closest('.card')
    expect(otra).not.toHaveTextContent('Valor consulta')
  })

  it('un valor guardado vuelve a aparecer escrito al abrir la página otra vez', () => {
    localStorage.setItem(
      'st_medicos',
      JSON.stringify([{ id: 'ESP001', especialidad: 'Medicina General', nombre: 'Dra. María Pérez', horaInicio: '08:00', horaFin: '17:00', duracion: 20, precio: 18000 }])
    )
    abrir()
    expect(campo('Dra. María Pérez')).toHaveValue(18000)
  })
})
