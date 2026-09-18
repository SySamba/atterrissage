import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../auth'
import { Btn, ErrorMsg, Field, Input, Modal } from './ui'

const ROLES = { admin: 'Administrateur', agent: 'Agent', demandeur: 'Exploitant' }

const sections = [
  {
    titre: 'Général',
    items: [
      { to: '/', label: 'Tableau de bord', end: true, roles: ['admin', 'agent'] },
    ],
  },
  {
    titre: 'Trafic aérien',
    items: [
      { to: '/vols', label: 'Vols', roles: ['admin', 'agent'] },
      { to: '/vols/nouveau', label: 'Saisir un vol', roles: ['admin', 'agent'] },
    ],
  },
  {
    titre: 'ASA — Survol & Atterrissage',
    items: [
      { to: '/demandes', label: 'Demandes' },
      { to: '/demandes/nouvelle', label: 'Nouvelle demande' },
      { to: '/representants', label: 'Représentants agréés', roles: ['admin', 'agent'] },
      { to: '/natures-vol', label: 'Natures de vol', roles: ['admin', 'agent'] },
    ],
  },
  {
    titre: 'Référentiels',
    items: [
      { to: '/compagnies', label: 'Compagnies', roles: ['admin', 'agent'] },
      { to: '/aeronefs', label: 'Aéronefs', roles: ['admin', 'agent'] },
      { to: '/aeroports', label: 'Aéroports', roles: ['admin', 'agent'] },
    ],
  },
  {
    titre: 'Administration',
    items: [
      { to: '/parametres', label: 'Paramètres', roles: ['admin', 'agent'] },
      { to: '/utilisateurs', label: 'Utilisateurs', roles: ['admin'] },
    ],
  },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)
  const [pwd, setPwd] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [pwdError, setPwdError] = useState(null)
  const [pwdOk, setPwdOk] = useState(false)
  const [saving, setSaving] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const openPwd = () => {
    setMenuOpen(false)
    setPwd({ current_password: '', password: '', password_confirmation: '' })
    setPwdError(null)
    setPwdOk(false)
    setPwdOpen(true)
  }

  const savePwd = async (e) => {
    e.preventDefault()
    setSaving(true)
    setPwdError(null)
    try {
      await api.put('/me/password', pwd)
      setPwdOk(true)
    } catch (err) {
      setPwdError(err)
    } finally {
      setSaving(false)
    }
  }

  const initiales = (user?.name ?? '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-blue-950 text-slate-200 flex flex-col fixed inset-y-0">
        <div className="px-4 py-4 border-b border-blue-900">
          <div className="bg-white rounded-md px-2 py-1 mb-2 w-24 mx-auto">
            <img src="/logo.png" alt="ADAC" className="w-full h-auto" />
          </div>
          <div className="text-xs font-bold text-yellow-400 tracking-wide uppercase text-center">République du Tchad</div>
          <div className="text-[11px] text-blue-300 leading-tight text-center">Autorité de l'Aviation Civile</div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {sections.map((s) => {
            const items = s.items.filter((i) => !i.roles || i.roles.includes(user?.role))
            if (!items.length) return null
            return (
              <div key={s.titre} className="mb-3">
                <div className="px-5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {s.titre}
                </div>
                {items.map((i) => (
                  <NavLink
                    key={i.to}
                    to={i.to}
                    end={i.end}
                    className={({ isActive }) =>
                      `block px-5 py-2 text-sm transition ${
                        isActive ? 'bg-blue-800 text-white' : 'text-slate-300 hover:bg-blue-900 hover:text-white'
                      }`
                    }
                  >
                    {i.label}
                  </NavLink>
                ))}
              </div>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Barre supérieure : menu utilisateur à droite */}
        <header className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-end">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 rounded-full hover:bg-slate-100 pl-1.5 pr-3 py-1.5 transition"
            >
              <span className="w-8 h-8 rounded-full bg-blue-800 text-white text-xs font-bold flex items-center justify-center">
                {initiales}
              </span>
              <span className="text-left">
                <span className="block text-sm font-medium text-slate-800 leading-tight">{user?.name}</span>
                <span className="block text-[11px] text-slate-500 leading-tight">{ROLES[user?.role] ?? user?.role}</span>
              </span>
              <svg className={`w-4 h-4 text-slate-400 transition ${menuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-60 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="text-sm font-medium text-slate-800">{user?.name}</div>
                  <div className="text-xs text-slate-500">{user?.email}</div>
                  {user?.organisme && <div className="text-xs text-slate-400">{user.organisme}</div>}
                </div>
                <button onClick={openPwd} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Changer mon mot de passe
                </button>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {/* Modal changement de mot de passe */}
      <Modal open={pwdOpen} onClose={() => setPwdOpen(false)} title="Changer mon mot de passe">
        {pwdOk ? (
          <div className="text-center py-4">
            <div className="text-green-600 font-medium mb-4">Mot de passe modifié avec succès.</div>
            <Btn onClick={() => setPwdOpen(false)}>Fermer</Btn>
          </div>
        ) : (
          <form onSubmit={savePwd}>
            <ErrorMsg error={pwdError} />
            <div className="space-y-4">
              <Field label="Mot de passe actuel" required>
                <Input type="password" value={pwd.current_password} onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })} required autoFocus />
              </Field>
              <Field label="Nouveau mot de passe" required>
                <Input type="password" value={pwd.password} onChange={(e) => setPwd({ ...pwd, password: e.target.value })} required minLength={6} />
              </Field>
              <Field label="Confirmer le nouveau mot de passe" required>
                <Input type="password" value={pwd.password_confirmation} onChange={(e) => setPwd({ ...pwd, password_confirmation: e.target.value })} required />
              </Field>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <Btn variant="secondary" type="button" onClick={() => setPwdOpen(false)}>Annuler</Btn>
              <Btn type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Modifier'}</Btn>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
