import { Navbar, Nav, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function Header() {
  return (
    <Navbar expand="md" bg="light" className="border-bottom">
      <Container>
        <Navbar.Brand as={Link} to="/">SaludTotal</Navbar.Brand>
        <Navbar.Toggle aria-controls="menu-principal" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/agendar">Agendar cita</Nav.Link>
            <Nav.Link as={Link} to="/mis-citas">Mis citas</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header