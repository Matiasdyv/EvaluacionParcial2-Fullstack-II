import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Col, Form, Row } from 'react-bootstrap'
import CampoFormulario from '../components/CampoFormulario'
import { registrarUsuario } from '../data/db'
import { REGIONES } from '../data/regiones'
import {
  calcularEdad,
  esEmailValido,
  esRutValido,
  esTelefonoValido,
  normalizarRut,
} from '../utils/validaciones'

const VACIO = {
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  fechaNacimiento: '',
  rut: '',
  nroDocumento: '',
  seguro: '',
  genero: '',
  region: '',
  direccion: '',
  email: '',
  telefono: '',
  password: '',
  confirmarPassword: '',
  terminos: false,
  ofertas: false,
}

// Revisa los valores y devuelve un mensaje por cada campo con problemas.
function validar(v) {
  const e = {}

  if (v.nombre.trim() === '') e.nombre = 'El nombre no puede estar vacío.'
  if (v.apellidoPaterno.trim() === '') e.apellidoPaterno = 'El apellido paterno no puede estar vacío.'
  if (v.apellidoMaterno.trim() === '') e.apellidoMaterno = 'El apellido materno no puede estar vacío.'

  if (v.fechaNacimiento === '') e.fechaNacimiento = 'Ingresa tu fecha de nacimiento.'
  else if (calcularEdad(v.fechaNacimiento) < 18) e.fechaNacimiento = 'Debes ser mayor de 18 años para registrarte.'

  if (v.rut.trim() === '') e.rut = 'El RUT no puede estar vacío.'
  else if (!esRutValido(v.rut)) e.rut = 'Ingresa un RUT válido con guion (ej: 12345678-5).'

  const documento = v.nroDocumento.trim()
  if (documento === '') e.nroDocumento = 'El número de documento no puede estar vacío.'
  else if (!/^[a-zA-Z0-9]{8,10}$/.test(documento)) e.nroDocumento = 'Debe tener entre 8 y 10 caracteres (sin puntos ni guiones).'

  if (v.seguro === '') e.seguro = 'Selecciona un seguro médico.'
  if (v.genero === '') e.genero = 'Selecciona una opción de género.'
  if (v.region === '') e.region = 'Selecciona tu región.'
  if (v.direccion.trim() === '') e.direccion = 'La dirección no puede estar vacía.'

  if (v.email.trim() === '') e.email = 'El correo electrónico no puede estar vacío.'
  else if (!esEmailValido(v.email)) e.email = 'Ingresa un correo electrónico válido.'

  if (v.telefono.trim() === '') e.telefono = 'El teléfono no puede estar vacío.'
  else if (!esTelefonoValido(v.telefono)) e.telefono = 'Ingresa un teléfono válido (ej: +56 9 1234 5678).'

  if (v.password === '') e.password = 'Ingresa una contraseña.'
  else if (v.password.length < 6) e.password = 'La contraseña debe tener al menos 6 caracteres.'

  if (v.confirmarPassword === '') e.confirmarPassword = 'Confirma tu contraseña.'
  else if (v.password !== v.confirmarPassword) e.confirmarPassword = 'Las contraseñas no coinciden.'

  if (!v.terminos) e.terminos = 'Debes aceptar los términos y condiciones.'

  return e
}

function Registro() {
  const [valores, setValores] = useState(VACIO)
  const [tocados, setTocados] = useState({})
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const [errorRegistro, setErrorRegistro] = useState('')
  const [registrado, setRegistrado] = useState(null)

  // Se recalcula en cada render: los errores se corrigen solos mientras se escribe.
  const errores = validar(valores)

  // Un error se muestra cuando ya se salió del campo o ya se intentó enviar.
  const errorVisible = (campo) => (intentoEnvio || tocados[campo] ? errores[campo] : undefined)

  const cambiar = (e) => {
    const { name, type, checked, value } = e.target
    setValores({ ...valores, [name]: type === 'checkbox' ? checked : value })
  }
  const marcarTocado = (e) => setTocados({ ...tocados, [e.target.name]: true })

  // Props que comparten todos los campos.
  const propsCampo = (campo) => ({
    value: valores[campo],
    onChange: cambiar,
    onBlur: marcarTocado,
    error: errorVisible(campo),
  })

  const manejarEnvio = (e) => {
    e.preventDefault()
    setErrorRegistro('')
    setIntentoEnvio(true)
    if (Object.keys(errores).length > 0) return

    const resultado = registrarUsuario({
      nombre: valores.nombre.trim(),
      apellidoPaterno: valores.apellidoPaterno.trim(),
      apellidoMaterno: valores.apellidoMaterno.trim(),
      fechaNacimiento: valores.fechaNacimiento,
      rut: normalizarRut(valores.rut),
      nroDocumento: valores.nroDocumento.trim(),
      seguro: valores.seguro,
      genero: valores.genero,
      region: valores.region,
      direccion: valores.direccion.trim(),
      email: valores.email.trim(),
      telefono: valores.telefono.replace(/\s/g, ''),
      password: valores.password,
      ofertas: valores.ofertas,
    })

    if (!resultado.ok) {
      setErrorRegistro(resultado.error)
      return
    }
    setRegistrado(resultado.usuario)
  }

  if (registrado) {
    return (
      <section>
        <h1>Crear cuenta</h1>
        <Alert variant="success">
          <Alert.Heading>¡Cuenta creada!</Alert.Heading>
          <p className="mb-0">
            Bienvenido/a, {registrado.nombre}. Ya puedes iniciar sesión con tu RUT y tu contraseña.
          </p>
        </Alert>
        <Link to="/login" className="btn btn-primary">Ir a iniciar sesión</Link>
      </section>
    )
  }

  return (
    <section>
      <h1>Crear cuenta</h1>
      <p>Regístrate para agendar y revisar tus citas médicas.</p>

      {errorRegistro && <Alert variant="danger">{errorRegistro}</Alert>}

      <Form noValidate onSubmit={manejarEnvio}>
        <Row>
          <Col md={4}>
            <CampoFormulario id="nombre" etiqueta="Nombre" placeholder="Ingresa tu nombre" autoComplete="given-name" {...propsCampo('nombre')} />
          </Col>
          <Col md={4}>
            <CampoFormulario id="apellidoPaterno" etiqueta="Apellido paterno" placeholder="Ingresa tu apellido" {...propsCampo('apellidoPaterno')} />
          </Col>
          <Col md={4}>
            <CampoFormulario id="apellidoMaterno" etiqueta="Apellido materno" placeholder="Ingresa tu apellido" {...propsCampo('apellidoMaterno')} />
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <CampoFormulario id="fechaNacimiento" etiqueta="Fecha de nacimiento" type="date" {...propsCampo('fechaNacimiento')} />
          </Col>
          <Col md={6}>
            <CampoFormulario id="rut" etiqueta="RUT" placeholder="12345678-5" {...propsCampo('rut')} />
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <CampoFormulario id="nroDocumento" etiqueta="Número de documento" placeholder="Ingresa tu número de documento" maxLength={10} {...propsCampo('nroDocumento')} />
          </Col>
          <Col md={6}>
            <CampoFormulario id="seguro" etiqueta="Seguro médico" tipo="select" {...propsCampo('seguro')}>
              <option value="">Selecciona</option>
              <option value="fonasa">Fonasa</option>
              <option value="isapre">Isapre</option>
            </CampoFormulario>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <CampoFormulario id="genero" etiqueta="Género" tipo="select" {...propsCampo('genero')}>
              <option value="">Selecciona</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </CampoFormulario>
          </Col>
          <Col md={6}>
            <CampoFormulario id="region" etiqueta="Región" tipo="select" {...propsCampo('region')}>
              <option value="">Selecciona</option>
              {REGIONES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </CampoFormulario>
          </Col>
        </Row>

        <CampoFormulario id="direccion" etiqueta="Dirección" placeholder="calle, número, depto" autoComplete="street-address" {...propsCampo('direccion')} />

        <Row>
          <Col md={6}>
            <CampoFormulario id="email" etiqueta="Correo electrónico" type="email" placeholder="ejemplo@mail.com" autoComplete="email" {...propsCampo('email')} />
          </Col>
          <Col md={6}>
            <CampoFormulario id="telefono" etiqueta="Teléfono" type="tel" placeholder="+56 9 1234 5678" autoComplete="tel" {...propsCampo('telefono')} />
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <CampoFormulario id="password" etiqueta="Contraseña" type="password" autoComplete="new-password" {...propsCampo('password')} />
          </Col>
          <Col md={6}>
            <CampoFormulario id="confirmarPassword" etiqueta="Confirmar contraseña" type="password" autoComplete="new-password" {...propsCampo('confirmarPassword')} />
          </Col>
        </Row>

        <Form.Check
          type="checkbox"
          id="terminos"
          name="terminos"
          className="mb-2"
          label="Acepto los términos y condiciones y Políticas de Privacidad."
          checked={valores.terminos}
          onChange={cambiar}
          onBlur={marcarTocado}
          isInvalid={!!errorVisible('terminos')}
          feedback={errorVisible('terminos')}
          feedbackType="invalid"
        />
        <Form.Check
          type="checkbox"
          id="ofertas"
          name="ofertas"
          className="mb-4"
          label="Deseo recibir novedades sobre convenios, promociones y servicios de salud."
          checked={valores.ofertas}
          onChange={cambiar}
        />

        <Button type="submit" size="lg">Registrarme</Button>

        <p className="mt-3">
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </Form>
    </section>
  )
}

export default Registro