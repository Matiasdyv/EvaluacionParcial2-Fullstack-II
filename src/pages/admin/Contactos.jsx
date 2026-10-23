import { useState } from 'react'
import { Badge, Button, Col, Form, Modal, Row, Table } from 'react-bootstrap'
import { actualizarMensaje, obtenerMensajes } from '../../data/db'

const COLOR_ESTADO = { Pendiente: 'warning', Respondido: 'success' }

// Las fechas vienen como DD/MM/AAAA; se invierten para poder ordenar de más nueva a más antigua.
const claveFecha = (fecha) => fecha.split('/').reverse().join('')

const masNuevosPrimero = (a, b) =>
  claveFecha(b.fecha).localeCompare(claveFecha(a.fecha)) || String(b.id).localeCompare(String(a.id))

function Contactos() {
  const [mensajes, setMensajes] = useState(() => obtenerMensajes())
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('')
  const [seleccionado, setSeleccionado] = useState(null)

  const texto = busqueda.trim().toLowerCase()
  const visibles = mensajes
    .filter((m) => estado === '' || m.estado === estado)
    .filter((m) => `${m.paciente} ${m.medico} ${m.motivo}`.toLowerCase().includes(texto))
    .sort(masNuevosPrimero)

  const marcarRespondido = (mensaje) => {
    actualizarMensaje(mensaje.id, { estado: 'Respondido' })
    setMensajes(obtenerMensajes())
    setSeleccionado({ ...mensaje, estado: 'Respondido' })
  }

  return (
    <div>
      <h1>Registro de contacto paciente / doctor</h1>
      <p>
        Gestiona las solicitudes de comunicación, consultas de recetas y mensajes entre
        pacientes y especialistas.
      </p>

      <Row className="mb-3">
        <Col md={8} className="mb-2">
          <Form.Control
            type="search"
            aria-label="Buscar mensajes"
            placeholder="Buscar por paciente, doctor o motivo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </Col>
        <Col md={4} className="mb-2">
          <Form.Select
            aria-label="Filtrar por estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Respondido">Respondidos</option>
          </Form.Select>
        </Col>
      </Row>

      <Table responsive hover className="align-middle">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Doctor</th>
            <th>Especialidad</th>
            <th>Motivo</th>
            <th>Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {visibles.map((m) => (
            <tr key={m.id}>
              <td>#{m.id}</td>
              <td>{m.fecha}</td>
              <td><strong>{m.paciente}</strong></td>
              <td>{m.medico}</td>
              <td>{m.especialidad}</td>
              <td>{m.motivo}</td>
              <td><Badge bg={COLOR_ESTADO[m.estado] ?? 'secondary'}>{m.estado}</Badge></td>
              <td className="text-center">
                <Button
                  size="sm"
                  aria-label={`Ver detalle del mensaje ${m.id}`}
                  onClick={() => setSeleccionado(m)}
                >
                  Ver detalle
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {visibles.length === 0 && <p className="text-muted">No se encontraron mensajes.</p>}

      <Modal show={seleccionado !== null} onHide={() => setSeleccionado(null)} animation={false} centered>
        {seleccionado && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Mensaje #{seleccionado.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="mb-1"><strong>Fecha:</strong> {seleccionado.fecha}</p>
              <p className="mb-1"><strong>Paciente:</strong> {seleccionado.paciente}</p>
              <p className="mb-1"><strong>Doctor:</strong> {seleccionado.medico}</p>
              <p className="mb-1"><strong>Especialidad:</strong> {seleccionado.especialidad}</p>
              {seleccionado.asunto && <p className="mb-1"><strong>Asunto:</strong> {seleccionado.asunto}</p>}
              {seleccionado.email && <p className="mb-1"><strong>Correo:</strong> {seleccionado.email}</p>}
              {seleccionado.telefono && <p className="mb-1"><strong>Teléfono:</strong> {seleccionado.telefono}</p>}
              <p className="mb-1"><strong>Motivo:</strong> {seleccionado.motivo}</p>
              <p className="mb-0">
                <strong>Estado:</strong>{' '}
                <Badge bg={COLOR_ESTADO[seleccionado.estado] ?? 'secondary'}>{seleccionado.estado}</Badge>
              </p>
            </Modal.Body>
            <Modal.Footer>
              {seleccionado.estado === 'Pendiente' && (
                <Button variant="success" onClick={() => marcarRespondido(seleccionado)}>
                  Marcar como respondido
                </Button>
              )}
              <Button variant="outline-secondary" onClick={() => setSeleccionado(null)}>
                Cerrar
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  )
}

export default Contactos
