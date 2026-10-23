import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'
import { actualizarMedico, crearCita, registrarUsuario } from '../../data/db'
import { iniciarSesionAdmin } from '../../data/admin'

const abrir = () =>
  render(
    <MemoryRouter initialEntries={['/admin']}>
      <App />
    </MemoryRouter>
  )

const tarjetaResumen = (titulo) => screen.getByText(titulo).closest('.card')

describe('Dashboard del administrador', () => {
  beforeEach(() => {
    localStorage.clear()
    iniciarSesionAdmin('admin@duoc.cl', 'admin123')
  })

  it('saluda al administrador y ofrece ver los reportes', () => {
    abrir()
    expect(screen.getByRole('heading', { name: '¡Hola, Administrador!' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver reportes' })).toHaveAttribute('href', '/admin/informes')
  })

  it('resume médicos, pacientes, citas y mensajes pendientes', () => {
    registrarUsuario({ rut: '12345678-5', email: 'ana@correo.cl', password: 'secreto', nombre: 'Ana' })
    crearCita({ id: 'ST-1', especialidad: 'Pediatría', medico: 'Dr. Juan López', fecha: '2099-01-01', hora: '10:00', observaciones: 'x' })
    crearCita({ id: 'ST-2', especialidad: 'Pediatría', medico: 'Dr. Juan López', fecha: '2099-01-02', hora: '10:00', observaciones: 'x' })
    abrir()
    expect(tarjetaResumen('Médicos')).toHaveTextContent('5Médicos')
    expect(tarjetaResumen('Pacientes registrados')).toHaveTextContent('1Pacientes registrados')
    expect(tarjetaResumen('Citas')).toHaveTextContent('2Citas')
    expect(tarjetaResumen('Mensajes pendientes')).toHaveTextContent('2Mensajes pendientes')
  })

  it('muestra una tarjeta por médico y su valor de consulta', () => {
    actualizarMedico('ESP002', { precio: 20000 })
    abrir()
    expect(screen.getByRole('heading', { name: 'Especialidades y médicos' })).toBeInTheDocument()
    expect(screen.getByText('Dra. Elena Rojas')).toBeInTheDocument()
    expect(screen.getAllByText(/Valor consulta: sin definir/)).toHaveLength(4)
    expect(screen.getByText(/Valor consulta: \$20\.000/)).toBeInTheDocument()
  })
})
