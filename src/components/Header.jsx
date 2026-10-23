import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'

function Header() {
  const { usuario, logout, admin } = useAuth()
  const navigate = useNavigate()

  const cerrarSesion = () => {
    logout()
    navigate('/')
  }

  return (
    <Navbar expand="md" bg="light" className="border-bottom">
      <Container>
        <Navbar.Brand as={Link} to="/">SaludTotal</Navbar.Brand>
        <Navbar.Toggle aria-controls="menu-principal" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="ms-auto align-items-md-center">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/agendar">Agendar cita</Nav.Link>
            <Nav.Link as={Link} to="/mis-citas">Mis citas</Nav.Link>
            <Nav.Link as={Link} to="/contacto">Contacto</Nav.Link>
            <Nav.Link as={Link} to="/nosotros">Nosotros</Nav.Link>
            <Nav.Link as={Link} to={admin ? '/admin' : '/admin/login'}>
              {admin ? 'Administración' : 'Administrador'}
            </Nav.Link>
            {usuario ? (
              <>
                <Navbar.Text className="ms-md-2">Hola, {usuario.nombre}</Navbar.Text>
                <Button variant="outline-secondary" size="sm" className="ms-md-2" onClick={cerrarSesion}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/registro">Registro</Nav.Link>
                <Nav.Link as={Link} to="/login">Iniciar sesión</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header