import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Col, Row } from 'react-bootstrap'
import { useAuth } from '../../context/auth'
import { obtenerCitas, obtenerMedicos, obtenerMensajes, obtenerUsuarios } from '../../data/db'
import { formatearPesos } from '../../utils/formato'

function Dashboard() {
  const { admin } = useAuth()
  const [medicos] = useState(() => obtenerMedicos())
  const [citas] = useState(() => obtenerCitas())
  const [mensajes] = useState(() => obtenerMensajes())
  const [usuarios] = useState(() => obtenerUsuarios())

  const resumen = [
    { titulo: 'Médicos', valor: medicos.length },
    { titulo: 'Pacientes registrados', valor: usuarios.length },
    { titulo: 'Citas', valor: citas.length },
    { titulo: 'Mensajes pendientes', valor: mensajes.filter((m) => m.estado === 'Pendiente').length },
  ]

  return (
    <div>
      <div className="p-4 mb-4 bg-light border rounded">
        <h1 className="h2">¡Hola, {admin.nombre}!</h1>
        <p className="mb-3">
          Bienvenido al panel centralizado de SaludTotal. Gestiona la atención médica, los
          informes y los costos del centro desde este portal.
        </p>
        <Link to="/admin/informes" className="btn btn-primary">Ver reportes</Link>
      </div>

      <Row className="mb-2">
        {resumen.map((r) => (
          <Col xs={6} lg={3} key={r.titulo} className="mb-3">
            <Card className="h-100 text-center shadow-sm">
              <Card.Body>
                <div className="display-6">{r.valor}</div>
                <div className="text-muted">{r.titulo}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <h2 className="h4 mt-3">Especialidades y médicos</h2>
      <Row>
        {medicos.map((m) => (
          <Col xs={12} md={6} lg={4} key={m.id} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>{m.especialidad}</Card.Title>
                <Card.Subtitle className="mb-3 text-muted">{m.nombre}</Card.Subtitle>
                <Card.Text>
                  Horario: {m.horaInicio} - {m.horaFin}
                  <br />
                  Duración: {m.duracion} min
                  <br />
                  Valor consulta: {m.precio === undefined ? 'sin definir' : formatearPesos(m.precio)}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default Dashboard
