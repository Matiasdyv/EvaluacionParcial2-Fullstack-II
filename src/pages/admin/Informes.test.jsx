import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'
import { actualizarCita, actualizarMedico, crearCita } from '../../data/db'
import { iniciarSesionAdmin } from '../../data/admin'

const abrir = () =>
  render(
    <MemoryRouter initialEntries={['/admin/informes']}>
      <App />
    </MemoryRouter>
  )

const agendar = (id, medico, especialidad, fecha, estado) => {
  crearCita({ id, especialidad, medico, fecha, hora: '10:00', observaciones: 'Control' })
  actualizarCita(id, { estado })
}

// "Ingreso estimado" también es título de una columna: se toma el texto que está dentro de una tarjeta.
const tarjeta = (texto) => screen.getAllByText(texto).map((e) => e.closest('.card')).find(Boolean)
const filasDetalle = () => within(screen.getByRole('table', { name: 'Detalle de citas' })).getAllByRole('row').slice(1)

describe('Informes del administrador', () => {
  beforeEach(() => {
    localStorage.clear()
    iniciarSesionAdmin('admin@duoc.cl', 'admin123')
    actualizarMedico('ESP001', { precio: 30000 })
    actualizarMedico('ESP002', { precio: 20000 })
    agendar('A', 'Dr. Juan López', 'Pediatría', '2026-11-02', 'Confirmada')
    agendar('B', 'Dr. Juan López', 'Pediatría', '2026-11-03', 'Atendida')
    agendar('C', 'Dra. María Pérez', 'Medicina General', '2026-11-04', 'Cancelada')
    agendar('D', 'Dra. María Pérez', 'Medicina General', '2026-12-01', 'Solicitada')
  })

  afterEach(() => vi.restoreAllMocks())

  it('muestra el total de citas, el ingreso estimado y el conteo por estado', () => {
    abrir()
    expect(tarjeta('Citas en el informe')).toHaveTextContent('4Citas en el informe')
    expect(tarjeta('Ingreso estimado')).toHaveTextContent('$40.000')
    for (const texto of ['Solicitada: 1', 'Confirmada: 1', 'Atendida: 1', 'Cancelada: 1', 'Inasistida: 0']) {
      expect(screen.getByText(texto)).toBeInTheDocument()
    }
  })

  it('resume las citas y el ingreso por especialidad', () => {
    abrir()
    const resumen = screen.getByRole('table', { name: 'Resumen por especialidad' })
    const pediatria = within(resumen).getByText('Pediatría').closest('tr')
    expect(pediatria).toHaveTextContent('2')
    expect(pediatria).toHaveTextContent('$40.000')
    const general = within(resumen).getByText('Medicina General').closest('tr')
    expect(general).toHaveTextContent('$0')
  })

  it('lista el detalle de las citas ordenadas por fecha', () => {
    abrir()
    expect(filasDetalle()).toHaveLength(4)
    expect(filasDetalle()[0]).toHaveTextContent('02/11/2026')
    expect(filasDetalle()[3]).toHaveTextContent('01/12/2026')
  })

  it('filtra por estado y recalcula el resumen', async () => {
    const user = userEvent.setup()
    abrir()
    await user.selectOptions(screen.getByLabelText('Estado'), 'Confirmada')
    expect(filasDetalle()).toHaveLength(1)
    expect(tarjeta('Citas en el informe')).toHaveTextContent('1Citas en el informe')
    expect(tarjeta('Ingreso estimado')).toHaveTextContent('$20.000')
  })

  it('filtra por especialidad', async () => {
    const user = userEvent.setup()
    abrir()
    await user.selectOptions(screen.getByLabelText('Especialidad'), 'Pediatría')
    expect(filasDetalle()).toHaveLength(2)
  })

  it('filtra por rango de fechas', () => {
    abrir()
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-11-03' } })
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-11-04' } })
    expect(filasDetalle()).toHaveLength(2)
  })

  it('avisa si la fecha final es anterior a la inicial y no hay resultados', () => {
    abrir()
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-12-01' } })
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-11-01' } })
    expect(screen.getByText('La fecha final no puede ser anterior a la inicial.')).toBeInTheDocument()
    expect(screen.getByText('No hay citas con esos filtros.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Descargar CSV' })).toBeDisabled()
  })

  it('"Descargar CSV" genera un archivo con las citas filtradas', async () => {
    const user = userEvent.setup()
    const crearUrl = vi.fn(() => 'blob:informe')
    const liberarUrl = vi.fn()
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: crearUrl, revokeObjectURL: liberarUrl }))
    let enlace = null
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      enlace = this
    })

    abrir()
    await user.selectOptions(screen.getByLabelText('Estado'), 'Atendida')
    await user.click(screen.getByRole('button', { name: 'Descargar CSV' }))

    expect(crearUrl).toHaveBeenCalledTimes(1)
    const archivo = crearUrl.mock.calls[0][0]
    expect(archivo.type).toContain('text/csv')
    const texto = await archivo.text()
    expect(texto).toContain('"B","2026-11-03","10:00","Pediatría","Dr. Juan López","Atendida"')
    expect(texto).not.toContain('"A"')
    expect(enlace.download).toBe('informe-citas.csv')
    expect(liberarUrl).toHaveBeenCalledWith('blob:informe')
  })
})
