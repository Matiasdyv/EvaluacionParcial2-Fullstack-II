import { Form } from 'react-bootstrap'

function CampoFormulario({ id, etiqueta, error, tipo = 'input', children, ...resto }) {
  return (
    <Form.Group className="mb-3" controlId={id}>
      <Form.Label>{etiqueta}</Form.Label>
      {tipo === 'select' ? (
        <Form.Select name={id} isInvalid={!!error} {...resto}>
          {children}
        </Form.Select>
      ) : (
        <Form.Control name={id} isInvalid={!!error} {...resto} />
      )}
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </Form.Group>
  )
}

export default CampoFormulario