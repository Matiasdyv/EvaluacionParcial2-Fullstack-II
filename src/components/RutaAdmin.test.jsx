import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { iniciarSesion, registrarUsuario } from '../data/db'
import { iniciarSesionAdmin } from '../data/admin'

const abrir = (ruta) =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>
  )

describe('RutaAdmin', () => {
  beforeEach(() => localStorage.clear())

  it.each(['/admin', '/admin/contactos', '/admin/costos', '/admin/informes'])(
    'sin sesión de administrador, %s lleva al login',
    (ruta) => {
      abrir(ruta)
      expect(screen.getByRole('heading', { name: 'Panel administrador' })).toBeInTheDocument()
    }
  )

  it('una sesión de paciente no da acceso al área de administración', () => {
    registrarUsuario({ rut: '12345678-5', email: 'ana@correo.cl', password: 'secreto', nombre: 'Ana' })
    iniciarSesion('12345678-5', 'secreto')
    abrir('/admin')
    expect(screen.getByRole('heading', { name: 'Panel administrador' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Hola, Administrador/ })).not.toBeInTheDocument()
  })

  it('con sesión de administrador muestra el menú y la página pedida', () => {
    iniciarSesionAdmin('admin@duoc.cl', 'admin123')
    abrir('/admin/costos')
    const menu = screen.getByRole('navigation', { name: 'Menú de administración' })
    expect(menu).toHaveTextContent('Panel')
    expect(menu).toHaveTextContent('Contacto paciente / doctor')
    expect(menu).toHaveTextContent('Informes')
    expect(menu).toHaveTextContent('Costos')
    expect(screen.getByRole('heading', { name: 'Modificar costos' })).toBeInTheDocument()
  })

  it('el menú de administración permite pasar de una página a otra', async () => {
    const user = userEvent.setup()
    iniciarSesionAdmin('admin@duoc.cl', 'admin123')
    abrir('/admin')
    const menu = screen.getByRole('navigation', { name: 'Menú de administración' })
    await user.click(menu.querySelector('a[href="/admin/informes"]'))
    expect(screen.getByRole('heading', { name: 'Generar informes' })).toBeInTheDocument()
    await user.click(menu.querySelector('a[href="/admin/contactos"]'))
    expect(screen.getByRole('heading', { name: 'Registro de contacto paciente / doctor' })).toBeInTheDocument()
  })

  it('cerrar sesión devuelve al login y vuelve a bloquear el panel', async () => {
    const user = userEvent.setup()
    iniciarSesionAdmin('admin@duoc.cl', 'admin123')
    abrir('/admin')
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión de administrador' }))
    expect(screen.getByRole('heading', { name: 'Panel administrador' })).toBeInTheDocument()
    expect(localStorage.getItem('st_sesion_admin')).toBeNull()
  })

  it('el menú superior ofrece "Administrador" y, con sesión, "Administración"', () => {
    const { unmount } = abrir('/')
    expect(screen.getByRole('link', { name: 'Administrador' })).toHaveAttribute('href', '/admin/login')
    unmount()

    iniciarSesionAdmin('admin@duoc.cl', 'admin123')
    abrir('/')
    expect(screen.getByRole('link', { name: 'Administración' })).toHaveAttribute('href', '/admin')
  })
})
