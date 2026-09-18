import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { Btn, ErrorMsg, Field, Input } from '../components/ui'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="ADAC" className="w-48 mx-auto mb-3" />
          <div className="text-xs font-bold text-yellow-600 uppercase tracking-wide">République du Tchad</div>
          <div className="text-lg font-bold text-blue-900">Autorité de l'Aviation Civile</div>
          <div className="text-sm text-slate-500 mt-1">
            Gestion des autorisations de survol et d'atterrissage
          </div>
        </div>
        <ErrorMsg error={error} />
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email" required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </Field>
          <Field label="Mot de passe" required>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <Btn type="submit" className="w-full" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </Btn>
        </form>
        <p className="text-sm text-slate-500 text-center mt-5">
          Exploitant ? <Link to="/register" className="text-blue-800 hover:underline">Créer un compte</Link>
        </p>
        <p className="text-xs text-slate-400 text-center mt-3">admin@adac.td / password</p>
      </div>
    </div>
  )
}
