import { Card, Button } from 'react-bootstrap'
import { formatearPesos } from '../utils/formato'

function MedicoCard({ medico, onSeleccionar }) {
  const { nombre, especialidad, horaInicio, horaFin, duracion, precio } = medico

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body className="d-flex flex-column">
        <Card.Title>{especialidad}</Card.Title>
        <Card.Subtitle className="mb-3 text-muted">{nombre}</Card.Subtitle>
        <Card.Text>
          Horario: {horaInicio} - {horaFin}
          <br />
          Duración: {duracion} min
          {precio !== undefined && (
            <>
              <br />
              Valor consulta: <strong>{formatearPesos(precio)}</strong>
            </>
          )}
        </Card.Text>
        <Button
          variant="primary"
          className="mt-auto"
          onClick={() => onSeleccionar(medico)}
        >
          Agendar cita
        </Button>
      </Card.Body>
    </Card>
  )
}

export default MedicoCard