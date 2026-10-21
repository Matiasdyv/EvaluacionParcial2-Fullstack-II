import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { crearMedico, obtenerMedicos } from '../data/db'

const abrir = (ruta = '/nosotros') =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>
  )

describe('Nosotros', () => {
  beforeEach(() => localStorage.clear())

  it('muestra el título y la historia del centro médico', () => {
    abrir()
    expect(screen.getByRole('heading', { name: 'Sobre SaludTotal' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nuestra historia' })).toBeInTheDocument()
    expect(screen.getByText(/Fundado en 2015/)).toBeInTheDocument()
  })

  it('incrusta el video institucional con una dirección embed válida', () => {
    abrir()
    const video = screen.getByTitle('Video institucional SaludTotal')
    expect(video).toHaveAttribute('src', 'https://www.youtube.com/embed/NDXwrT92_rI?start=7')
    expect(video).toHaveAttribute('allowfullscreen')
  })

  it('muestra la misión y la visión', () => {
    abrir()
    expect(screen.getByRole('heading', { name: 'Misión' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Visión' })).toBeInTheDocument()
  })

  it('lista a todos los médicos de la base de datos', () => {
    abrir()
    const medicos = obtenerMedicos()
    expect(screen.getAllByRole('listitem')).toHaveLength(medicos.length)
    expect(screen.getByText('Dra. María Pérez')).toBeInTheDocument()
  })

  it('un médico nuevo aparece en el equipo sin cambiar la página', () => {
    crearMedico({
      id: 'ESP006', especialidad: 'Cardiología', nombre: 'Dr. Pablo Mena',
      horaInicio: '08:00', horaFin: '14:00', duracion: 30,
    })
    abrir()
    expect(screen.getByText('Dr. Pablo Mena')).toBeInTheDocument()
    expect(screen.getByText('Cardiología:')).toBeInTheDocument()
  })

  it('el menú tiene el enlace "Nosotros"', async () => {
    const user = userEvent.setup()
    abrir('/')
    await user.click(screen.getByRole('link', { name: 'Nosotros' }))
    expect(screen.getByRole('heading', { name: 'Sobre SaludTotal' })).toBeInTheDocument()
  })
})
