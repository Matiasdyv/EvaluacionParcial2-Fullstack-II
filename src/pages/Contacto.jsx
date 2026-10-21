import { useState } from 'react'
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap'
import { crearMensaje } from '../data/db'

const ASUNTOS = {
  consulta: 'Consulta general',
  reclamo: 'Sugerencia o reclamo',
  soporte: 'Soporte con la plataforma',
}

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGEX_TELEFONO = /^(\+?56)?9\d{8}$/

const VACIO = { nombre: '', email: '', telefono: '', asunto: '', mensaje: '' }

// Revisa los valores y devuelve un objeto con un mensaje por cada campo con problemas.
function validar(valores) {
  const errores = {}

  const nombre = valores.nombre.trim()
  if (nombre === '') errores.nombre = 'El nombre no puede estar vacío.'
  else if (nombre.length < 3) errores.nombre = 'Ingresa tu nombre completo.'

  const email = valores.email.trim()
  if (email === '') errores.email = 'El correo electrónico no puede estar vacío.'
  else if (!REGEX_EMAIL.test(email)) errores.email = 'Ingresa un correo electrónico válido.'

  const telefono = valores.telefono.replace(/\s/g, '')
  if (telefono === '') errores.telefono = 'El teléfono no puede estar vacío.'
  else if (!REGEX_TELEFONO.test(telefono)) errores.telefono = 'Ingresa un teléfono válido (ej: +56 9 1234 5678).'

  if (valores.asunto === '') errores.asunto = 'Selecciona un motivo de contacto.'

  const mensaje = valores.mensaje.trim()
  if (mensaje === '') errores.mensaje = 'El mensaje no puede estar vacío.'
  else if (mensaje.length < 10) errores.mensaje = 'Tu mensaje debe tener al menos 10 caracteres.'

  return errores
}

function Contacto() {
  const [valores, setValores] = useState(VACIO)
  const [tocados, setTocados] = useState({})
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const [enviado, setEnviado] = useState(null)

  // Se recalcula en cada render: los errores se corrigen solos mientras el usuario escribe.
  const errores = validar(valores)

  // Un error se muestra cuando el usuario ya salió del campo o ya intentó enviar.
  const errorVisible = (campo) => (intentoEnvio || tocados[campo] ? errores[campo] : undefined)

  const cambiar = (e) => setValores({ ...valores, [e.target.name]: e.target.value })
  const marcarTocado = (e) => setTocados({ ...tocados, [e.target.name]: true })

  const manejarEnvio = (e) => {
    e.preventDefault()
    setIntentoEnvio(true)
    if (Object.keys(errores).length > 0) return

    const mensaje = crearMensaje({
      fecha: new Date().toLocaleDateString('en-GB'),
      paciente: valores.nombre.trim(),
      medico: '—',
      especialidad: '—',
      motivo: valores.mensaje.trim(),
      email: valores.email.trim(),
      telefono: valores.telefono.trim(),
      asunto: ASUNTOS[valores.asunto],
    })
    setEnviado(mensaje)
  }

  const enviarOtro = () => {
    setValores(VACIO)
    setTocados({})
    setIntentoEnvio(false)
    setEnviado(null)
  }

  return (
    <section>
      <h1>Contacto</h1>
      <p>Estamos aquí para responder tus dudas y atender tus consultas sobre nuestros servicios médicos.</p>

      <Row>
        <Col lg={7} className="mb-4">
          {enviado ? (
            <>
              <Alert variant="success">
                <Alert.Heading>¡Mensaje enviado!</Alert.Heading>
                <p className="mb-1">Gracias, {enviado.paciente}. Recibimos tu mensaje.</p>
                <p className="mb-0">Te responderemos al correo {enviado.email}.</p>
              </Alert>
              <Button variant="outline-primary" onClick={enviarOtro}>
                Enviar otro mensaje
              </Button>
            </>
          ) : (
            <Form noValidate onSubmit={manejarEnvio}>
              <Form.Group className="mb-3" controlId="nombre">
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  placeholder="Ingresa tu nombre"
                  autoComplete="name"
                  value={valores.nombre}
                  onChange={cambiar}
                  onBlur={marcarTocado}
                  isInvalid={!!errorVisible('nombre')}
                />
                <Form.Control.Feedback type="invalid">{errorVisible('nombre')}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  value={valores.email}
                  onChange={cambiar}
                  onBlur={marcarTocado}
                  isInvalid={!!errorVisible('email')}
                />
                <Form.Control.Feedback type="invalid">{errorVisible('email')}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="telefono">
                <Form.Label>Teléfono de contacto</Form.Label>
                <Form.Control
                  type="tel"
                  name="telefono"
                  placeholder="+56 9 1234 5678"
                  autoComplete="tel"
                  value={valores.telefono}
                  onChange={cambiar}
                  onBlur={marcarTocado}
                  isInvalid={!!errorVisible('telefono')}
                />
                <Form.Control.Feedback type="invalid">{errorVisible('telefono')}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="asunto">
                <Form.Label>Motivo de contacto</Form.Label>
                <Form.Select
                  name="asunto"
                  value={valores.asunto}
                  onChange={cambiar}
                  onBlur={marcarTocado}
                  isInvalid={!!errorVisible('asunto')}
                >
                  <option value="">Selecciona una opción</option>
                  {Object.entries(ASUNTOS).map(([clave, etiqueta]) => (
                    <option key={clave} value={clave}>{etiqueta}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errorVisible('asunto')}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="mensaje">
                <Form.Label>Mensaje</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="mensaje"
                  placeholder="Escribe tu mensaje aquí..."
                  value={valores.mensaje}
                  onChange={cambiar}
                  onBlur={marcarTocado}
                  isInvalid={!!errorVisible('mensaje')}
                />
                <Form.Control.Feedback type="invalid">{errorVisible('mensaje')}</Form.Control.Feedback>
              </Form.Group>

              <Button type="submit" size="lg">Enviar mensaje</Button>
            </Form>
          )}
        </Col>

        <Col lg={5} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Información de atención</Card.Title>
              <p className="mb-1"><strong>Dirección:</strong> Av. Providencia 1234, Santiago</p>
              <p className="mb-1"><strong>Teléfono:</strong> +56 2 2345 6789</p>
              <p className="mb-0"><strong>Horario de atención:</strong> Lunes a Viernes de 08:00 a 20:00 hrs</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </section>
  )
}

export default Contacto
