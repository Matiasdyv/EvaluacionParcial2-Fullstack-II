import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Badge, Button, Card, Col, Row } from 'react-bootstrap'
import { actualizarCita, obtenerCitas } from '../data/db'

// Color de la etiqueta según el estado de la cita.
const COLOR_ESTADO = {
  Solicitada: 'warning',
  Confirmada: 'success',
  Atendida: 'secondary',
  Cancelada: 'danger',
  Inasistida: 'dark',
}

const formatearFecha = (fecha) => fecha.split('-').reverse().join('/')

// Ordena de la cita más próxima a la más lejana.
const porFechaYHora = (a, b) =>
  `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`)

function MisCitas() {
  const [citas, setCitas] = useState(() => obtenerCitas())

  const cambiarEstado = (id, estado) => {
    actualizarCita(id, { estado })
    setCitas(obtenerCitas())
  }

  const porConfirmar = citas.filter((c) => c.estado === 'Solicitada').sort(porFechaYHora)
  const historial = citas.filter((c) => c.estado !== 'Solicitada').sort(porFechaYHora)

  const tarjeta = (cita) => (
    <Col xs={12} md={6} lg={4} key={cita.id} className="mb-4">
      <Card as="article" aria-label={`Cita ${cita.id}`} className="h-100 shadow-sm">
        <Card.Body className="d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <Card.Title className="mb-0">{cita.especialidad}</Card.Title>
            <Badge bg={COLOR_ESTADO[cita.estado] ?? 'secondary'}>{cita.estado}</Badge>
          </div>
          <Card.Subtitle className="mb-3 text-muted">{cita.medico}</Card.Subtitle>
          <Card.Text>
            Código: {cita.id}
            <br />
            Fecha: {formatearFecha(cita.fecha)}
            <br />
            Hora: {cita.hora} hrs
            <br />
            Motivo: {cita.observaciones}
          </Card.Text>

          {(cita.estado === 'Solicitada' || cita.estado === 'Confirmada') && (
            <div className="mt-auto d-flex gap-2">
              {cita.estado === 'Solicitada' && (
                <Button variant="success" onClick={() => cambiarEstado(cita.id, 'Confirmada')}>
                  Confirmar
                </Button>
              )}
              <Button variant="outline-danger" onClick={() => cambiarEstado(cita.id, 'Cancelada')}>
                Cancelar
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Col>
  )

  return (
    <section>
      <h1>Mis citas</h1>
      <p>Revisa tus citas, confírmalas o cancélalas.</p>

      {citas.length === 0 && (
        <Alert variant="info">
          Todavía no tienes citas.{' '}
          <Alert.Link as={Link} to="/agendar">Agenda tu primera cita</Alert.Link>
        </Alert>
      )}

      {porConfirmar.length > 0 && (
        <>
          <h2 className="h4">Por confirmar</h2>
          <p className="text-muted">
            Estas citas están solicitadas. Confírmalas para reservar tu horario o cancélalas.
          </p>
          <Row>{porConfirmar.map(tarjeta)}</Row>
        </>
      )}

      {historial.length > 0 && (
        <>
          <h2 className="h4">Historial</h2>
          <Row>{historial.map(tarjeta)}</Row>
        </>
      )}
    </section>
  )
}

export default MisCitas
