import { useState } from 'react'
import { Alert, Button, Col, Form, InputGroup, ListGroup, Row } from 'react-bootstrap'
import { actualizarMedico, obtenerMedicos } from '../../data/db'
import { formatearPesos } from '../../utils/formato'
import { validarPrecio } from '../../utils/validacionesAdmin'

function Costos() {
  const [medicos, setMedicos] = useState(() => obtenerMedicos())
  // Lo que el administrador escribe en cada fila (texto), indexado por id del médico.
  const [valores, setValores] = useState(() =>
    Object.fromEntries(medicos.map((m) => [m.id, m.precio === undefined ? '' : String(m.precio)]))
  )
  const [errores, setErrores] = useState({})
  const [aviso, setAviso] = useState('')

  const cambiar = (id, texto) => {
    setValores({ ...valores, [id]: texto })
    setErrores({ ...errores, [id]: '' })
    setAviso('')
  }

  const guardar = (medico) => {
    const error = validarPrecio(valores[medico.id])
    if (error) {
      setErrores({ ...errores, [medico.id]: error })
      setAviso('')
      return
    }
    const precio = Number(valores[medico.id])
    actualizarMedico(medico.id, { precio })
    setMedicos(obtenerMedicos())
    setAviso(`Valor de ${medico.nombre} actualizado a ${formatearPesos(precio)}.`)
  }

  return (
    <div>
      <h1>Modificar costos</h1>
      <p>
        Define el valor de la consulta de cada médico. El cambio se ve de inmediato en el
        catálogo de la página de inicio.
      </p>

      {aviso && <Alert variant="success" role="status">{aviso}</Alert>}

      <ListGroup as="ul" variant="flush">
        {medicos.map((m) => (
          <ListGroup.Item as="li" key={m.id} className="py-3">
            <Row className="align-items-center g-2">
              <Col md={4}>
                <div className="fw-semibold">{m.nombre}</div>
                <div className="text-muted">{m.especialidad}</div>
              </Col>
              <Col xs={12} md={3}>
                Valor actual:{' '}
                <strong>{m.precio === undefined ? 'Sin definir' : formatearPesos(m.precio)}</strong>
              </Col>
              <Col xs={12} md={5}>
                <InputGroup hasValidation>
                  <Form.Control
                    type="number"
                    inputMode="numeric"
                    aria-label={`Nuevo valor para ${m.nombre}`}
                    placeholder="Nuevo valor. Ej: 25000"
                    value={valores[m.id]}
                    onChange={(e) => cambiar(m.id, e.target.value)}
                    isInvalid={!!errores[m.id]}
                  />
                  <Button
                    aria-label={`Guardar valor de ${m.nombre}`}
                    onClick={() => guardar(m)}
                  >
                    Guardar
                  </Button>
                  <Form.Control.Feedback type="invalid">{errores[m.id]}</Form.Control.Feedback>
                </InputGroup>
              </Col>
            </Row>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  )
}

export default Costos
