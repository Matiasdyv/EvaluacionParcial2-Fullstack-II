import { useState } from 'react'
import { Row, Col, Form } from 'react-bootstrap'
import MedicoCard from '../components/MedicoCard'
import { obtenerMedicos } from '../data/db'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()
  const [medicos] = useState(() => obtenerMedicos())
  const [busqueda, setBusqueda] = useState('')

  const filtrados = medicos.filter((m) =>
    `${m.especialidad} ${m.nombre}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  )

  const manejarSeleccion = (medico) => {
    alert(navigate('/agendar/' + medico.id))
  }

  return (
    <section>
      <h1>Bienvenido a SaludTotal</h1>
      <p>Agenda tu cita médica en línea.</p>

      <Form.Control
        type="search"
        aria-label="Buscar médico"
        placeholder="Buscar por especialidad o médico..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-4"
      />

      <Row>
        {filtrados.map((medico) => (
          <Col xs={12} md={6} lg={4} key={medico.id} className="mb-4">
            <MedicoCard medico={medico} onSeleccionar={manejarSeleccion} />
          </Col>
        ))}
      </Row>

      {filtrados.length === 0 && (
        <p className="text-muted">No se encontraron médicos.</p>
      )}
    </section>
  )
}

export default Home