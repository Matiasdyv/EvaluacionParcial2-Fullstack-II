import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import AgendarCita from './pages/AgendarCita'
import MisCitas from './pages/MisCitas'

function App() {
  return (
    <>
      <Header />
      <main className="container my-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/agendar" element={<AgendarCita key="sin-medico" />} />
          <Route path="/agendar/:id" element={<AgendarCita key="con-medico" />} />
          <Route path="/mis-citas" element={<MisCitas />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App