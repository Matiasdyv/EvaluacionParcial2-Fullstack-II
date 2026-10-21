import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { obtenerCitas } from '../data/db'

const FECHA_FUTURA = '2099-12-31'

const abrir = (ruta) =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>
  )

const campo = (nombre) => screen.getByRole('combobox', { name: nombre })

const completarYEnviar = async (user, { fecha = FECHA_FUTURA, hora = '10:00' } = {}) => {
  fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: fecha } })
  fireEvent.change(screen.getByLabelText('Hora'), { target: { value: hora } })
  await user.click(screen.getByRole('button', { name: /confirmar y agendar cita/i }))
}

describe('AgendarCita', () => {
  beforeEach(() => localStorage.clear())

  it('desde Home abre el formulario con el médico ya elegido', async () => {
    const user = userEvent.setup()
    abrir('/')
    const tarjetaPediatria = screen.getByText('Pediatría').closest('.card')
    await user.click(tarjetaPediatria.querySelector('button'))
    expect(campo('Especialidad')).toHaveValue('Pediatría')
    expect(campo('Médico')).toHaveValue('ESP002')
  })

  it('sin médico elegido, el select de médico espera a la especialidad', async () => {
    const user = userEvent.setup()
    abrir('/agendar')
    expect(campo('Médico')).toBeDisabled()
    await user.selectOptions(campo('Especialidad'), 'Dermatología')
    expect(campo('Médico')).toBeEnabled()
    expect(screen.getByRole('option', { name: 'Dra. Elena Rojas' })).toBeInTheDocument()
  })

  it('cambiar la especialidad borra el médico elegido', async () => {
    const user = userEvent.setup()
    abrir('/agendar/ESP002')
    await user.selectOptions(campo('Especialidad'), 'Ginecología')
    expect(campo('Médico')).toHaveValue('')
  })

  it('enviar vacío muestra los errores y no guarda nada', async () => {
    const user = userEvent.setup()
    abrir('/agendar')
    await user.click(screen.getByRole('button', { name: /confirmar y agendar cita/i }))
    expect(screen.getByText('Selecciona una especialidad.')).toBeInTheDocument()
    expect(screen.getByText('Selecciona un médico.')).toBeInTheDocument()
    expect(screen.getByText('Selecciona la fecha de la cita.')).toBeInTheDocument()
    expect(screen.getByText('Selecciona la hora de la cita.')).toBeInTheDocument()
    expect(obtenerCitas()).toHaveLength(0)
  })

  it('rechaza una fecha pasada', async () => {
    const user = userEvent.setup()
    abrir('/agendar/ESP002')
    await completarYEnviar(user, { fecha: '2020-01-01' })
    expect(screen.getByText('La fecha no puede ser anterior a hoy.')).toBeInTheDocument()
    expect(obtenerCitas()).toHaveLength(0)
  })

  it('rechaza una hora fuera del horario del médico', async () => {
    const user = userEvent.setup()
    abrir('/agendar/ESP002') // Dr. Juan López atiende de 09:00 a 18:00
    await completarYEnviar(user, { hora: '08:00' })
    expect(screen.getByText('Dr. Juan López atiende de 09:00 a 18:00.')).toBeInTheDocument()
    expect(obtenerCitas()).toHaveLength(0)
  })

  it('agenda una cita válida y la guarda como Solicitada', async () => {
    const user = userEvent.setup()
    abrir('/agendar/ESP002')
    await completarYEnviar(user)
    expect(screen.getByText('¡Cita agendada!')).toBeInTheDocument()
    const citas = obtenerCitas()
    expect(citas).toHaveLength(1)
    expect(citas[0]).toMatchObject({ medico: 'Dr. Juan López', fecha: FECHA_FUTURA, hora: '10:00', estado: 'Solicitada' })
    expect(citas[0].id).toMatch(/^ST-\d{6}$/)
  })

  it('muestra el error cuando el horario ya está reservado', async () => {
    const user = userEvent.setup()
    abrir('/agendar/ESP002')
    await completarYEnviar(user)
    await user.click(screen.getByRole('button', { name: /agendar otra cita/i }))
    await completarYEnviar(user)
    expect(screen.getByText('Ese horario ya está reservado.')).toBeInTheDocument()
    expect(obtenerCitas()).toHaveLength(1)
  })

  it('al ir por el menú de /agendar/ESP002 a /agendar, el formulario queda vacío', async () => {
    const user = userEvent.setup()
    abrir('/agendar/ESP002')
    expect(campo('Especialidad')).toHaveValue('Pediatría')
    await user.click(screen.getByRole('link', { name: 'Agendar cita' }))
    expect(campo('Especialidad')).toHaveValue('')
  })
})
