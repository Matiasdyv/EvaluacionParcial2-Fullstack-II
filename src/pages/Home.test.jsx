import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'

const renderizarHome = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agendar/:id" element={<p>Pantalla de agendar</p>} />
      </Routes>
    </MemoryRouter>
  )

describe('Home', () => {
  beforeEach(() => localStorage.clear())

  it('muestra una tarjeta por cada médico', () => {
    renderizarHome()
    expect(screen.getAllByRole('button', { name: /agendar cita/i })).toHaveLength(5)
  })

  it('filtra la lista al escribir en el buscador', async () => {
    const user = userEvent.setup()
    renderizarHome()
    await user.type(screen.getByRole('searchbox', { name: 'Buscar médico' }), 'pediatr')
    expect(screen.getAllByRole('button', { name: /agendar cita/i })).toHaveLength(1)
    expect(screen.getByText('Dr. Juan López')).toBeInTheDocument()
  })

  it('avisa cuando no hay resultados', async () => {
    const user = userEvent.setup()
    renderizarHome()
    await user.type(screen.getByRole('searchbox', { name: 'Buscar médico' }), 'zzz')
    expect(screen.getByText('No se encontraron médicos.')).toBeInTheDocument()
  })

  it('al pulsar Agendar cita navega a la pantalla de agendar', async () => {
    const user = userEvent.setup()
    renderizarHome()
    await user.click(screen.getAllByRole('button', { name: /agendar cita/i })[0])
    expect(screen.getByText('Pantalla de agendar')).toBeInTheDocument()
  })
})
