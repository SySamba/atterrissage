import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import Layout from './components/Layout'
import Aeronefs from './pages/Aeronefs'
import Aeroports from './pages/Aeroports'
import Compagnies from './pages/Compagnies'
import Dashboard from './pages/Dashboard'
import DemandeForm from './pages/DemandeForm'
import Demandes from './pages/Demandes'
import Login from './pages/Login'
import NaturesVol from './pages/NaturesVol'
import Parametres from './pages/Parametres'
import Register from './pages/Register'
import Representants from './pages/Representants'
import Users from './pages/Users'
import VolForm from './pages/VolForm'
import Vols from './pages/Vols'

function Protected() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Chargement…</div>
  if (!user) return <Navigate to="/login" replace />
  return <Layout />
}

function Home() {
  const { user } = useAuth()
  if (user?.role === 'demandeur') return <Navigate to="/demandes" replace />
  return <Dashboard />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Protected />}>
        <Route path="/" element={<Home />} />
        <Route path="/demandes" element={<Demandes />} />
        <Route path="/demandes/nouvelle" element={<DemandeForm />} />
        <Route path="/demandes/:id/modifier" element={<DemandeForm />} />
        <Route path="/representants" element={<Representants />} />
        <Route path="/natures-vol" element={<NaturesVol />} />
        <Route path="/vols" element={<Vols />} />
        <Route path="/vols/nouveau" element={<VolForm />} />
        <Route path="/vols/:id/modifier" element={<VolForm />} />
        <Route path="/aeroports" element={<Aeroports />} />
        <Route path="/compagnies" element={<Compagnies />} />
        <Route path="/aeronefs" element={<Aeronefs />} />
        <Route path="/etats" element={<Navigate to="/" replace />} />
        <Route path="/parametres" element={<Parametres />} />
        <Route path="/utilisateurs" element={<Users />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
