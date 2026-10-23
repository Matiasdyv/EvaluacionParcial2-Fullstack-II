import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import AgendarCita from './pages/AgendarCita'
import MisCitas from './pages/MisCitas'
import Contacto from './pages/Contacto'
import Nosotros from './pages/Nosotros'
import Registro from './pages/Registro'
import Login from './pages/Login'
import RutaAdmin from './components/RutaAdmin'
import LoginAdmin from './pages/admin/LoginAdmin'
import Dashboard from './pages/admin/Dashboard'
import Contactos from './pages/admin/Contactos'
import Costos from './pages/admin/Costos'
import Informes from './pages/admin/Informes'

function App() {
  return (
    <AuthProvider>
      <Header />
      <main className="container my-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/agendar" element={<AgendarCita key="sin-medico" />} />
          <Route path="/agendar/:id" element={<AgendarCita key="con-medico" />} />
          <Route path="/mis-citas" element={<MisCitas />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<LoginAdmin />} />
          <Route path="/admin" element={<RutaAdmin />}>
            <Route index element={<Dashboard />} />
            <Route path="contactos" element={<Contactos />} />
            <Route path="costos" element={<Costos />} />
            <Route path="informes" element={<Informes />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  )
}

export default App