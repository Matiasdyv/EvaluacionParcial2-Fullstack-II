// Base de datos simulada: guarda todo en localStorage y ofrece CRUD.

export const ESTADOS_CITA = [
  'Solicitada',
  'Confirmada',
  'Atendida',
  'Cancelada',
  'Inasistida',
]

const CLAVES = {
  medicos: 'st_medicos',
  citas: 'st_citas',
  mensajes: 'st_mensajes',
  usuarios: 'st_usuarios',
  sesion: 'st_sesion',
}

const MEDICOS_INICIALES = [
  { id: 'ESP001', especialidad: 'Medicina General', nombre: 'Dra. María Pérez', horaInicio: '08:00', horaFin: '17:00', duracion: 20 },
  { id: 'ESP002', especialidad: 'Pediatría', nombre: 'Dr. Juan López', horaInicio: '09:00', horaFin: '18:00', duracion: 25 },
  { id: 'ESP003', especialidad: 'Ginecología', nombre: 'Dra. Ana González', horaInicio: '08:00', horaFin: '16:00', duracion: 30 },
  { id: 'ESP004', especialidad: 'Traumatología', nombre: 'Dr. Carlos Soto', horaInicio: '10:00', horaFin: '19:00', duracion: 25 },
  { id: 'ESP005', especialidad: 'Dermatología', nombre: 'Dra. Elena Rojas', horaInicio: '09:00', horaFin: '17:00', duracion: 20 },
]

const MENSAJES_INICIALES = [
  { id: 101, fecha: '10/09/2026', paciente: 'Carlos Mendoza', medico: 'Dra. María Pérez', especialidad: 'Medicina General', motivo: 'Consulta sobre dosis de receta', estado: 'Pendiente' },
  { id: 102, fecha: '09/09/2026', paciente: 'Andrea Silva', medico: 'Dr. Juan López', especialidad: 'Pediatría', motivo: 'Solicitud de examen preventivo', estado: 'Respondido' },
  { id: 103, fecha: '08/09/2026', paciente: 'Roberto Gómez', medico: 'Dr. Carlos Soto', especialidad: 'Traumatología', motivo: 'Malestar posterior a control', estado: 'Pendiente' },
]

const INICIALES = {
  [CLAVES.medicos]: MEDICOS_INICIALES,
  [CLAVES.mensajes]: MENSAJES_INICIALES,
}

// ---------- Funciones genéricas (CRUD) ----------

function leer(clave) {
  const iniciales = INICIALES[clave] ?? []
  try {
    const texto = localStorage.getItem(clave)
    if (texto === null) {
      localStorage.setItem(clave, JSON.stringify(iniciales))
      return [...iniciales]
    }
    return JSON.parse(texto)
  } catch {
    return [...iniciales]
  }
}

function guardar(clave, lista) {
  localStorage.setItem(clave, JSON.stringify(lista))
}

function crear(clave, item) {
  const nuevo = { ...item, id: item.id ?? Date.now() }
  guardar(clave, [...leer(clave), nuevo])
  return nuevo
}

function actualizar(clave, id, cambios) {
  const lista = leer(clave).map((it) => (it.id === id ? { ...it, ...cambios } : it))
  guardar(clave, lista)
  return lista.find((it) => it.id === id)
}

function eliminar(clave, id) {
  guardar(clave, leer(clave).filter((it) => it.id !== id))
}

// ---------- Médicos ----------

export const obtenerMedicos = () => leer(CLAVES.medicos)
export const obtenerMedico = (id) => obtenerMedicos().find((m) => m.id === id)
export const crearMedico = (medico) => crear(CLAVES.medicos, medico)
export const actualizarMedico = (id, cambios) => actualizar(CLAVES.medicos, id, cambios)
export const eliminarMedico = (id) => eliminar(CLAVES.medicos, id)

// ---------- Citas ----------

export const obtenerCitas = () => leer(CLAVES.citas)

export const crearCita = (cita) => {
  // Evita las dobles reservas: mismo médico, fecha y hora.
  const hayConflicto = obtenerCitas().some(
    (c) =>
      c.medico === cita.medico &&
      c.fecha === cita.fecha &&
      c.hora === cita.hora &&
      c.estado !== 'Cancelada'
  )
  if (hayConflicto) {
    return { ok: false, error: 'Ese horario ya está reservado.' }
  }
  const nueva = crear(CLAVES.citas, { ...cita, estado: 'Solicitada' })
  return { ok: true, cita: nueva }
}

export const actualizarCita = (id, cambios) => actualizar(CLAVES.citas, id, cambios)
export const eliminarCita = (id) => eliminar(CLAVES.citas, id)

// ---------- Mensajes de contacto paciente / doctor ----------

export const obtenerMensajes = () => leer(CLAVES.mensajes)
export const crearMensaje = (mensaje) => crear(CLAVES.mensajes, { ...mensaje, estado: 'Pendiente' })
export const actualizarMensaje = (id, cambios) => actualizar(CLAVES.mensajes, id, cambios)
export const eliminarMensaje = (id) => eliminar(CLAVES.mensajes, id)

// ---------- Usuarios y sesión ----------

export const obtenerUsuarios = () => leer(CLAVES.usuarios)

export const registrarUsuario = (usuario) => {
  const usuarios = obtenerUsuarios()
  if (usuarios.some((u) => u.rut === usuario.rut)) {
    return { ok: false, error: 'Ya existe una cuenta con ese RUT.' }
  }
  if (usuarios.some((u) => u.email.toLowerCase() === usuario.email.toLowerCase())) {
    return { ok: false, error: 'Ya existe una cuenta con ese correo.' }
  }
  const nuevo = crear(CLAVES.usuarios, { ...usuario, id: usuario.rut })
  return { ok: true, usuario: nuevo }
}

export const iniciarSesion = (rut, password) => {
  const usuario = obtenerUsuarios().find((u) => u.rut === rut && u.password === password)
  if (!usuario) {
    return { ok: false, error: 'RUT o contraseña incorrectos.' }
  }
  localStorage.setItem(CLAVES.sesion, JSON.stringify(usuario.rut))
  return { ok: true, usuario }
}

export const cerrarSesion = () => localStorage.removeItem(CLAVES.sesion)

export const obtenerUsuarioActual = () => {
  try {
    const rut = JSON.parse(localStorage.getItem(CLAVES.sesion))
    return obtenerUsuarios().find((u) => u.rut === rut) ?? null
  } catch {
    return null
  }
}