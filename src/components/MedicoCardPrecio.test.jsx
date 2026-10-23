import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MedicoCard from './MedicoCard'

const medico = {
  id: 'ESP002',
  especialidad: 'Pediatría',
  nombre: 'Dr. Juan López',
  horaInicio: '09:00',
  horaFin: '18:00',
  duracion: 25,
}

describe('MedicoCard con valor de consulta', () => {
  it('muestra el valor cuando el administrador lo definió', () => {
    render(<MedicoCard medico={{ ...medico, precio: 20000 }} onSeleccionar={vi.fn()} />)
    expect(screen.getByText('$20.000')).toBeInTheDocument()
    expect(screen.getByText(/Valor consulta/)).toBeInTheDocument()
  })

  it('no muestra la línea de valor cuando no hay precio', () => {
    render(<MedicoCard medico={medico} onSeleccionar={vi.fn()} />)
    expect(screen.queryByText(/Valor consulta/)).not.toBeInTheDocument()
  })
})
