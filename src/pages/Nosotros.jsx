import { useState } from 'react'
import { Card, Col, ListGroup, Ratio, Row } from 'react-bootstrap'
import { obtenerMedicos } from '../data/db'

function Nosotros() {
  // El equipo se lee de la base de datos: si se agrega un médico, aparece aquí solo.
  const [medicos] = useState(() => obtenerMedicos())

  return (
    <section>
      <h1>Sobre SaludTotal</h1>
      <p className="lead">
        Conoce nuestra historia, equipo y compromiso con la salud en Santiago Centro.
      </p>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h4">Nuestra historia</Card.Title>
          <Card.Text>
            Fundado en 2015, <strong>SaludTotal</strong> es un centro médico multidisciplinario
            ubicado en la comuna de Santiago Centro. Nos especializamos en brindar atención
            médica primaria y avanzada de alta calidad, atendiendo a un promedio de 200
            pacientes diarios y gestionando más de 4.000 consultas al mes.
          </Card.Text>
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h4">Video institucional</Card.Title>
          <Ratio aspectRatio="16x9">
            <iframe
              src="https://www.youtube.com/embed/NDXwrT92_rI?start=7"
              title="Video institucional SaludTotal"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Ratio>
        </Card.Body>
      </Card>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title as="h2" className="h4">Misión</Card.Title>
              <Card.Text>
                Ofrecer servicios médicos integrales y accesibles, garantizando una atención
                humana, ágil y oportuna para todos nuestros pacientes y sus familias.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title as="h2" className="h4">Visión</Card.Title>
              <Card.Text>
                Ser el centro médico líder en transformación digital y calidad de atención en
                la región, eliminando tiempos de espera innecesarios mediante procesos digitales
                eficientes.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="h4">Nuestro equipo médico</Card.Title>
          <Card.Text>
            Contamos con un equipo profesional de 25 especialistas distribuidos en las
            principales áreas de la medicina:
          </Card.Text>
          <ListGroup as="ul" variant="flush">
            {medicos.map((m) => (
              <ListGroup.Item as="li" key={m.id}>
                <strong>{m.especialidad}:</strong> {m.nombre}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </section>
  )
}

export default Nosotros
