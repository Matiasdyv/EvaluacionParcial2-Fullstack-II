import { useState } from 'react'
import { Badge, Button, Card, Col, Form, Row, Table } from 'react-bootstrap'
import { ESTADOS_CITA, obtenerCitas, obtenerMedicos } from '../../data/db'
import { formatearFecha, formatearPesos } from '../../utils/formato'
import {
  construirCsv,
  contarPorEstado,
  filtrarCitas,
  ingresoTotal,
  resumenPorEspecialidad,
} from '../../utils/informes'

const COLOR_ESTADO = {
  Solicitada: 'warning',
  Confirmada: 'success',
  Atendida: 'secondary',
  Cancelada: 'danger',
  Inasistida: 'dark',
}

const porFechaYHora = (a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`)

function Informes() {
  const [citas] = useState(() => obtenerCitas())
  const [medicos] = useState(() => obtenerMedicos())
  const [filtros, setFiltros] = useState({ estado: '', especialidad: '', desde: '', hasta: '' })

  const especialidades = [...new Set(medicos.map((m) => m.especialidad))]
  const cambiar = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value })

  const filtradas = filtrarCitas(citas, filtros).sort(porFechaYHora)
  const porEstado = contarPorEstado(filtradas)
  const porEspecialidad = resumenPorEspecialidad(filtradas, medicos)
  const rangoInvalido = filtros.desde !== '' && filtros.hasta !== '' && filtros.desde > filtros.hasta

  const descargarCsv = () => {
    // El carácter invisible del inicio hace que Excel muestre bien las tildes.
    const blob = new Blob(['\uFEFF' + construirCsv(filtradas, medicos)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = 'informe-citas.csv'
    enlace.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h1>Generar informes</h1>
      <p>Revisa las citas del centro, filtra por estado, especialidad o fecha, y descarga el informe.</p>

      <Row className="mb-3">
        <Col sm={6} lg={3} className="mb-2">
          <Form.Group controlId="estado">
            <Form.Label>Estado</Form.Label>
            <Form.Select name="estado" value={filtros.estado} onChange={cambiar}>
              <option value="">Todos</option>
              {ESTADOS_CITA.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col sm={6} lg={3} className="mb-2">
          <Form.Group controlId="especialidad">
            <Form.Label>Especialidad</Form.Label>
            <Form.Select name="especialidad" value={filtros.especialidad} onChange={cambiar}>
              <option value="">Todas</option>
              {especialidades.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col sm={6} lg={3} className="mb-2">
          <Form.Group controlId="desde">
            <Form.Label>Desde</Form.Label>
            <Form.Control type="date" name="desde" value={filtros.desde} onChange={cambiar} />
          </Form.Group>
        </Col>
        <Col sm={6} lg={3} className="mb-2">
          <Form.Group controlId="hasta">
            <Form.Label>Hasta</Form.Label>
            <Form.Control
              type="date"
              name="hasta"
              value={filtros.hasta}
              onChange={cambiar}
              isInvalid={rangoInvalido}
            />
            <Form.Control.Feedback type="invalid">
              La fecha final no puede ser anterior a la inicial.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col xs={6} lg={3} className="mb-3">
          <Card className="h-100 text-center shadow-sm">
            <Card.Body>
              <div className="display-6">{filtradas.length}</div>
              <div className="text-muted">Citas en el informe</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} lg={3} className="mb-3">
          <Card className="h-100 text-center shadow-sm">
            <Card.Body>
              <div className="display-6">{formatearPesos(ingresoTotal(filtradas, medicos))}</div>
              <div className="text-muted">Ingreso estimado</div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="text-muted mb-2">Citas por estado</div>
              {ESTADOS_CITA.map((e) => (
                <Badge key={e} bg={COLOR_ESTADO[e]} className="me-2 mb-1">
                  {e}: {porEstado[e] ?? 0}
                </Badge>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <p className="text-muted small">
        El ingreso estimado suma el valor de consulta de las citas confirmadas y atendidas.
      </p>

      <h2 className="h4">Resumen por especialidad</h2>
      <Table responsive size="sm" aria-label="Resumen por especialidad">
        <thead>
          <tr>
            <th>Especialidad</th>
            <th>Citas</th>
            <th>Ingreso estimado</th>
          </tr>
        </thead>
        <tbody>
          {porEspecialidad.map((f) => (
            <tr key={f.especialidad}>
              <td>{f.especialidad}</td>
              <td>{f.total}</td>
              <td>{formatearPesos(f.ingreso)}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 mb-2 gap-2">
        <h2 className="h4 mb-0">Detalle de citas</h2>
        <Button variant="outline-primary" onClick={descargarCsv} disabled={filtradas.length === 0}>
          Descargar CSV
        </Button>
      </div>
      <Table responsive hover size="sm" aria-label="Detalle de citas">
        <thead>
          <tr>
            <th>Código</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Especialidad</th>
            <th>Médico</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {filtradas.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{formatearFecha(c.fecha)}</td>
              <td>{c.hora}</td>
              <td>{c.especialidad}</td>
              <td>{c.medico}</td>
              <td><Badge bg={COLOR_ESTADO[c.estado] ?? 'secondary'}>{c.estado}</Badge></td>
            </tr>
          ))}
        </tbody>
      </Table>
      {filtradas.length === 0 && <p className="text-muted">No hay citas con esos filtros.</p>}
    </div>
  )
}

export default Informes
