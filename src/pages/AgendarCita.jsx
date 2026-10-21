import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Button, Col, Form, Row } from 'react-bootstrap'
import { crearCita, obtenerMedicos } from '../data/db'

function AgendarCita() {
  const { id } = useParams()
  const [medicos] = useState(() => obtenerMedicos())
  const medicoInicial = medicos.find((m) => m.id === id)

  const [especialidad, setEspecialidad] = useState(medicoInicial?.especialidad ?? '')
  const [medicoId, setMedicoId] = useState(medicoInicial?.id ?? '')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [errores, setErrores] = useState({})
  const [errorReserva, setErrorReserva] = useState('')
  const [citaCreada, setCitaCreada] = useState(null)

  const especialidades = [...new Set(medicos.map((m) => m.especialidad))]
  const medicosDeEspecialidad = medicos.filter((m) => m.especialidad === especialidad)
  const medicoElegido = medicos.find((m) => m.id === medicoId)
  const hoy = new Date().toLocaleDateString('en-CA') // AAAA-MM-DD en hora local

  const cambiarEspecialidad = (e) => {
    setEspecialidad(e.target.value)
    setMedicoId('')
  }

  const validar = () => {
    const nuevos = {}
    if (!especialidad) nuevos.especialidad = 'Selecciona una especialidad.'
    if (!medicoId) nuevos.medico = 'Selecciona un médico.'
    if (!fecha) nuevos.fecha = 'Selecciona la fecha de la cita.'
    else if (fecha < hoy) nuevos.fecha = 'La fecha no puede ser anterior a hoy.'
    if (!hora) nuevos.hora = 'Selecciona la hora de la cita.'
    else if (medicoElegido && (hora < medicoElegido.horaInicio || hora >= medicoElegido.horaFin)) {
      nuevos.hora = `${medicoElegido.nombre} atiende de ${medicoElegido.horaInicio} a ${medicoElegido.horaFin}.`
    }
    return nuevos
  }

  const manejarEnvio = (e) => {
    e.preventDefault()
    setErrorReserva('')

    const nuevos = validar()
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    const resultado = crearCita({
      id: 'ST-' + Math.floor(100000 + Math.random() * 900000),
      especialidad,
      medico: medicoElegido.nombre,
      fecha,
      hora,
      observaciones: observaciones.trim() || 'Sin observaciones particulares.',
    })

    if (!resultado.ok) {
      setErrorReserva(resultado.error)
      return
    }
    setCitaCreada(resultado.cita)
  }

  const agendarOtra = () => {
    setCitaCreada(null)
    setFecha('')
    setHora('')
    setObservaciones('')
    setErrores({})
  }

  if (citaCreada) {
    return (
      <section>
        <h1>Agendar cita</h1>
        <Alert variant="success">
          <Alert.Heading>¡Cita agendada!</Alert.Heading>
          <p className="mb-1">Código: <strong>{citaCreada.id}</strong></p>
          <p className="mb-1">Especialidad: {citaCreada.especialidad}</p>
          <p className="mb-1">Médico: {citaCreada.medico}</p>
          <p className="mb-1">Fecha: {citaCreada.fecha.split('-').reverse().join('/')}</p>
          <p className="mb-1">Hora: {citaCreada.hora} hrs</p>
          <p className="mb-0">Estado: {citaCreada.estado}</p>
        </Alert>
        <Button variant="outline-primary" onClick={agendarOtra}>
          Agendar otra cita
          <Link to="/mis-citas" className="btn btn-primary ms-2">
            Ver mis citas
          </Link>
        </Button>
      </section>
    )
  }

  return (
    <section>
      <h1>Agendar cita</h1>
      <p>Elige la especialidad, el médico y el horario que prefieras.</p>

      {errorReserva && <Alert variant="danger">{errorReserva}</Alert>}

      <Form noValidate onSubmit={manejarEnvio}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="especialidad">
              <Form.Label>Especialidad</Form.Label>
              <Form.Select
                value={especialidad}
                onChange={cambiarEspecialidad}
                isInvalid={!!errores.especialidad}
              >
                <option value="">-- Selecciona una especialidad --</option>
                {especialidades.map((esp) => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errores.especialidad}</Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3" controlId="medico">
              <Form.Label>Médico</Form.Label>
              <Form.Select
                value={medicoId}
                onChange={(e) => setMedicoId(e.target.value)}
                disabled={!especialidad}
                isInvalid={!!errores.medico}
              >
                <option value="">
                  {especialidad ? '-- Selecciona un médico --' : '-- Primero elige una especialidad --'}
                </option>
                {medicosDeEspecialidad.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errores.medico}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="fecha">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                min={hoy}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                isInvalid={!!errores.fecha}
              />
              <Form.Control.Feedback type="invalid">{errores.fecha}</Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3" controlId="hora">
              <Form.Label>Hora</Form.Label>
              <Form.Control
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                isInvalid={!!errores.hora}
              />
              <Form.Control.Feedback type="invalid">{errores.hora}</Form.Control.Feedback>
              {medicoElegido && (
                <Form.Text muted>
                  Atiende de {medicoElegido.horaInicio} a {medicoElegido.horaFin}, citas de {medicoElegido.duracion} min.
                </Form.Text>
              )}
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4" controlId="observaciones">
          <Form.Label>Motivo de la consulta (opcional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Escribe brevemente el motivo de tu consulta..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" variant="primary" size="lg">
          Confirmar y agendar cita
        </Button>
      </Form>
    </section>
  )
}

export default AgendarCita
