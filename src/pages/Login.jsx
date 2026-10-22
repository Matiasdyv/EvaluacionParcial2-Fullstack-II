import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap'
import CampoFormulario from '../components/CampoFormulario'
import { useAuth } from '../context/auth'
import { esRutValido, normalizarRut } from '../utils/validaciones'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')
  const [errores, setErrores] = useState({})
  const [errorLogin, setErrorLogin] = useState('')

  const manejarEnvio = (e) => {
    e.preventDefault()
    setErrorLogin('')

    const nuevos = {}
    if (rut.trim() === '') nuevos.rut = 'Debes ingresar tu RUT.'
    else if (!esRutValido(rut)) nuevos.rut = 'Ingresa un RUT válido con guion (ej: 12345678-5).'
    if (password === '') nuevos.password = 'La contraseña no puede estar vacía.'

    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    const resultado = login(normalizarRut(rut), password)
    if (!resultado.ok) {
      setErrorLogin(resultado.error)
      return
    }
    navigate('/')
  }

  return (
    <section>
      <Row className="justify-content-center">
        <Col md={8} lg={5}>
          <Card className="shadow-sm">
            <Card.Body>
              <h1 className="h3 mb-3">Iniciar sesión</h1>

              {errorLogin && <Alert variant="danger">{errorLogin}</Alert>}

              <Form noValidate onSubmit={manejarEnvio}>
                <CampoFormulario
                  id="rut"
                  etiqueta="RUT"
                  placeholder="Ej: 12345678-5"
                  autoComplete="username"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  error={errores.rut}
                />
                <CampoFormulario
                  id="password"
                  etiqueta="Contraseña"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errores.password}
                />
                <div className="d-grid">
                  <Button type="submit" size="lg">Ingresar</Button>
                </div>
              </Form>

              <p className="mt-3 mb-0 text-center">
                ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </section>
  )
}

export default Login