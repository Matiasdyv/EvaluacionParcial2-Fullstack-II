# SaludTotal web

Aplicación web de gestión de citas médicas para el centro médico SaludTotal, desarrollada con **React + Vite + Bootstrap** como parte de la Evaluación Parcial 2 de **DSY1104 Desarrollo Fullstack II** (Duoc UC).

Tiene dos vistas:

- **Área pública (pacientes):** catálogo de médicos con buscador, agendar cita, mis citas, contacto, nosotros, registro e inicio de sesión.
- **Área de administración:** inicio de sesión de administrador, panel, contacto paciente/doctor, modificación de costos e informes de citas (con descarga en CSV).

Los datos se guardan en el navegador (LocalStorage) a través de `src/data/db.js`, que simula una base de datos.

## Tecnologías

React 19, Vite, react-router-dom, react-bootstrap / Bootstrap 5, Vitest, Testing Library y jsdom.

## Cómo instalar y ejecutar

Requisito: tener [Node.js](https://nodejs.org) (versión LTS) instalado.

```bash
npm install      # instala las dependencias
npm run dev      # inicia la app; abrir la dirección que muestra la terminal (normalmente http://localhost:5173)
```

## Cómo ejecutar las pruebas

```bash
npm test             # corre todas las pruebas una vez
npm run test:watch   # las corre mientras se edita el código
npm run coverage     # pruebas + reporte de cobertura (HTML en coverage/index.html)
```

Resultado actual: 21 archivos de prueba, **153 pruebas aprobadas**, cobertura de 99,5 % (sentencias), 98 % (ramas), 98,35 % (funciones) y 99,38 % (líneas).

Se usa **Vitest** (herramienta vista en clase) en lugar de Jasmine/Karma.

## Otros comandos

```bash
npm run build    # genera la versión de producción
npm run lint     # revisa el código con ESLint
```

## Datos para probar

| Rol | Cómo ingresar |
| --- | --- |
| Administrador | `/admin/login` → correo `admin@duoc.cl`, contraseña `admin123` |
| Paciente | `/registro` para crear una cuenta (RUT de prueba válido: `12345678-5`) y luego `/login` |

## Estructura del proyecto

```
src/
  components/   Header, Footer, MedicoCard, CampoFormulario, RutaAdmin
  pages/        Home, AgendarCita, MisCitas, Contacto, Nosotros, Registro, Login
  pages/admin/  LoginAdmin, Dashboard, Contactos, Costos, Informes
  context/      AuthProvider (sesión del paciente)
  data/         db.js (base de datos simulada), admin.js, regiones.js
  utils/        validaciones, formato e informes
```

Cada archivo `.jsx` / `.js` tiene su prueba `*.test.jsx` / `*.test.js` al lado.

## Documentos

- ERS v2 (Especificación de Requisitos de Software)
- Documento de cobertura de testing

## Equipo

Proyecto desarrollado en equipo de 3 integrantes. El detalle de los aportes está en el historial de commits del repositorio.
