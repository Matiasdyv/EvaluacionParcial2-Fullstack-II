import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button, Nav } from 'react-bootstrap'
import { useAuth } from '../context/auth'

// Protege todas las páginas /admin: sin sesión de administrador, vuelve al login.
// Con sesión, muestra el menú del área de administración y la página pedida (Outlet).
function RutaAdmin() {
  const { admin, logoutAdmin } = useAuth()
  const navigate = useNavigate()

  if (!admin) return <Navigate to="/admin/login" replace />

  const cerrarSesion = () => {
    logoutAdmin()
    navigate('/admin/login')
  }

  return (
    <section>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4 pb-3 border-bottom">
        <Nav as="nav" variant="pills" aria-label="Menú de administración">
          <Nav.Link as={NavLink} to="/admin" end>Panel</Nav.Link>
          <Nav.Link as={NavLink} to="/admin/contactos">Contacto paciente / doctor</Nav.Link>
          <Nav.Link as={NavLink} to="/admin/informes">Informes</Nav.Link>
          <Nav.Link as={NavLink} to="/admin/costos">Costos</Nav.Link>
        </Nav>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted">{admin.email}</span>
          <Button variant="outline-secondary" size="sm" onClick={cerrarSesion}>
            Cerrar sesión de administrador
          </Button>
        </div>
      </div>
      <Outlet />
    </section>
  )
}

export default RutaAdmin
