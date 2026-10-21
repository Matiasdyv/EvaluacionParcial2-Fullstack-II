import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MedicoCard from './MedicoCard'

const medico = {
  id: 'ESP001',
  especialidad: 'Medicina General',
  nombre: 'Dra. María Pérez',
  horaInicio: '08:00',
  horaFin: '17:00',
  duracion: 20,
}

describe('MedicoCard', () => {
  it('muestra especialidad, nombre y horario', () => {
    // Arrange + Act
    render(<MedicoCard medico={medico} onSeleccionar={vi.fn()} />)
    // Assert
    expect(screen.getByText('Medicina General')).toBeInTheDocument()
    expect(screen.getByText('Dra. María Pérez')).toBeInTheDocument()
    expect(screen.getByText(/08:00 - 17:00/)).toBeInTheDocument()
  })

  it('avisa con el médico al pulsar Agendar cita', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSeleccionar = vi.fn()
    render(<MedicoCard medico={medico} onSeleccionar={onSeleccionar} />)
    // Act
    await user.click(screen.getByRole('button', { name: /agendar cita/i }))
    // Assert
    expect(onSeleccionar).toHaveBeenCalledOnce()
    expect(onSeleccionar).toHaveBeenCalledWith(medico)
  })
})
