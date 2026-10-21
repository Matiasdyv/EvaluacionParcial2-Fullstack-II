import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { crearCita, obtenerCitas } from '../data/db'

const abrir = (ruta = '/mis-citas') =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>
  )

const cita = (id, extra = {}) => ({
  id,
  especialidad: 'Pediatría',
  medico: 'Dr. Juan López',
  fecha: '2099-12-31',
  hora: '10:00',
  observaciones: 'Control de rutina',
  ...extra,
})

const tarjeta = (id) => screen.getByRole('article', { name: `Cita ${id}` })

describe('MisCitas', () => {
  beforeEach(() => localStorage.clear())

  it('sin citas muestra un aviso con enlace para agendar', () => {
    abrir()
    expect(screen.getByText(/todavía no tienes citas/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /agenda tu primera cita/i })).toHaveAttribute('href', '/agendar')
  })

  it('muestra las citas solicitadas en "Por confirmar" con sus datos', () => {
    crearCita(cita('ST-100001'))
    abrir()
    expect(screen.getByRole('heading', { name: 'Por confirmar' })).toBeInTheDocument()
    const t = tarjeta('ST-100001')
    expect(within(t).getByText('Dr. Juan López')).toBeInTheDocument()
    expect(within(t).getByText(/31\/12\/2099/)).toBeInTheDocument()
    expect(within(t).getByText('Solicitada')).toBeInTheDocument()
    expect(within(t).getByRole('button', { name: 'Confirmar' })).toBeInTheDocument()
    expect(within(t).getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('confirmar una cita la guarda como Confirmada y la pasa al historial', async () => {
    const user = userEvent.setup()
    crearCita(cita('ST-100002'))
    abrir()
    await user.click(within(tarjeta('ST-100002')).getByRole('button', { name: 'Confirmar' }))
    expect(obtenerCitas()[0].estado).toBe('Confirmada')
    expect(screen.queryByRole('heading', { name: 'Por confirmar' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Historial' })).toBeInTheDocument()
    expect(within(tarjeta('ST-100002')).getByText('Confirmada')).toBeInTheDocument()
  })

  it('cancelar una cita la marca Cancelada y libera el horario', async () => {
    const user = userEvent.setup()
    crearCita(cita('ST-100003'))
    abrir()
    await user.click(within(tarjeta('ST-100003')).getByRole('button', { name: 'Cancelar' }))
    expect(obtenerCitas()[0].estado).toBe('Cancelada')
    expect(within(tarjeta('ST-100003')).queryByRole('button')).not.toBeInTheDocument()
    expect(crearCita(cita('ST-100004')).ok).toBe(true)
  })

  it('ordena las citas de la más próxima a la más lejana', () => {
    crearCita(cita('ST-200002', { fecha: '2099-12-31' }))
    crearCita(cita('ST-200001', { fecha: '2099-01-02' }))
    abrir()
    const ids = screen.getAllByRole('article').map((a) => a.getAttribute('aria-label'))
    expect(ids).toEqual(['Cita ST-200001', 'Cita ST-200002'])
  })

  it('al agendar una cita, "Ver mis citas" la muestra por confirmar', async () => {
    const user = userEvent.setup()
    abrir('/agendar/ESP002')
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2099-12-31' } })
    fireEvent.change(screen.getByLabelText('Hora'), { target: { value: '10:00' } })
    await user.click(screen.getByRole('button', { name: /confirmar y agendar cita/i }))
    await user.click(screen.getByRole('link', { name: 'Ver mis citas' }))
    expect(screen.getByRole('heading', { name: 'Por confirmar' })).toBeInTheDocument()
    expect(screen.getByText('Dr. Juan López')).toBeInTheDocument()
  })

  it('el menú tiene el enlace "Mis citas"', async () => {
    const user = userEvent.setup()
    abrir('/')
    await user.click(screen.getByRole('link', { name: 'Mis citas' }))
    expect(screen.getByRole('heading', { name: 'Mis citas' })).toBeInTheDocument()
  })
})
