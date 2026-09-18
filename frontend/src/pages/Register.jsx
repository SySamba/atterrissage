import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../auth'
import { Btn, ErrorMsg, Field, Input } from '../components/ui'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth() // eslint-disable-line no-unused-vars
  const [form, setForm] = useState({ name: '', organisme: '', email: '', password: '', password_confirmation: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/register', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = '/demandes'
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
          <img src="/logo.png" alt="ADAC" className="w-40 mx-auto mb-3" />
          <div className="text-2xl font-bold text-blue-900">Créer un compte</div>
          <div className="text-sm text-slate-500 mt-1">
            Espace exploitant — déposez vos demandes de<br />survol et d'atterrissage
          </div>
        </div>
        <ErrorMsg error={error} />
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nom complet" required>
            <Input value={form.name} onChange={set('name')} required autoFocus />
          </Field>
          <Field label="Organisme / Compagnie">
            <Input value={form.organisme} onChange={set('organisme')} placeholder="Ex : Sahel Aviation" />
          </Field>
          <Field label="Email" required>
            <Input type="email" value={form.email} onChange={set('email')} required />
          </Field>
          <Field label="Mot de passe" required>
            <Input type="password" value={form.password} onChange={set('password')} required minLength={6} />
          </Field>
          <Field label="Confirmer le mot de passe" required>
            <Input type="password" value={form.password_confirmation} onChange={set('password_confirmation')} required />
          </Field>
          <Btn type="submit" className="w-full" disabled={loading}>
            {loading ? 'Création…' : "Créer mon compte"}
          </Btn>
        </form>
        <p className="text-sm text-slate-500 text-center mt-5">
          Déjà un compte ? <Link to="/login" className="text-blue-800 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
