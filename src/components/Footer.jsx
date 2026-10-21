function Footer() {
  const anio = new Date().getFullYear()

  return (
    <footer className="border-top py-3 text-center text-muted">
      <small>© {anio} SaludTotal. Todos los derechos reservados.</small>
    </footer>
  )
}

export default Footer