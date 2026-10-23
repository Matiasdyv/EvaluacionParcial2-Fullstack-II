import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap'
import CampoFormulario from '../../components/CampoFormulario'
import { useAuth } from '../../context/auth'
import { validarLoginAdmin } from '../../utils/validacionesAdmin'

function LoginAdmin() {
  const { admin, loginAdmin } = useAuth()
  const navigate = useNavigate()
  const [valores, setValores] = useState({ correo: '', password: '' })
  const [tocados, setTocados] = useState({})
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const [errorLogin, setErrorLogin] = useState('')

  // Si ya hay una sesión de administrador, no tiene sentido mostrar el formulario.
  if (admin) return <Navigate to="/admin" replace />

  // Se recalcula en cada render: los errores se corrigen solos mientras se escribe.
  const errores = validarLoginAdmin(valores)
  const errorVisible = (campo) => (intentoEnvio || tocados[campo] ? errores[campo] : undefined)

  const cambiar = (e) => setValores({ ...valores, [e.target.name]: e.target.value })
  const marcarTocado = (e) => setTocados({ ...tocados, [e.target.name]: true })

  const manejarEnvio = (e) => {
    e.preventDefault()
    setErrorLogin('')
    setIntentoEnvio(true)
    if (Object.keys(errores).length > 0) return

    const resultado = loginAdmin(valores.correo, valores.password)
    if (!resultado.ok) {
      setErrorLogin(resultado.error)
      return
    }
    navigate('/admin')
  }

  return (
    <section>
      <Row className="justify-content-center">
        <Col md={8} lg={5}>
          <Card className="shadow-sm">
            <Card.Body>
              <h1 className="h3 mb-1">Panel administrador</h1>
              <p className="text-muted">Acceso exclusivo para el personal de SaludTotal.</p>

              {errorLogin && <Alert variant="danger">{errorLogin}</Alert>}

              <Form noValidate onSubmit={manejarEnvio}>
                <CampoFormulario
                  id="correo"
                  etiqueta="Correo"
                  type="email"
                  placeholder="Ej: admin@duoc.cl"
                  autoComplete="username"
                  value={valores.correo}
                  onChange={cambiar}
                  onBlur={marcarTocado}
                  error={errorVisible('correo')}
                />
                <CampoFormulario
                  id="password"
                  etiqueta="Contraseña"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  maxLength={10}
                  value={valores.password}
                  onChange={cambiar}
                  onBlur={marcarTocado}
                  error={errorVisible('password')}
                />
                <div className="d-grid">
                  <Button type="submit" size="lg">Ingresar</Button>
                </div>
              </Form>

              <p className="mt-3 mb-0 text-center">
                <Link to="/">Volver al inicio</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </section>
  )
}

export default LoginAdmin
