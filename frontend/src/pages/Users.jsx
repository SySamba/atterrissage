import CrudPage from '../components/CrudPage'
import { Badge, Select } from '../components/ui'

const ROLES = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'agent', label: 'Agent (interne ADAC)' },
  { value: 'demandeur', label: 'Demandeur (externe)' },
]

export default function Users() {
  return (
    <CrudPage
      title="Utilisateurs"
      subtitle="Comptes des utilisateurs internes et externes"
      endpoint="/users"
      columns={[
        { key: 'name', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Rôle', render: (r) => <Badge color="violet">{ROLES.find((x) => x.value === r.role)?.label}</Badge> },
        { key: 'actif', label: 'Actif', render: (r) => (r.actif ? <Badge color="green">Oui</Badge> : <Badge color="red">Non</Badge>) },
      ]}
      fields={[
        { name: 'name', label: 'Nom', required: true },
        { name: 'email', label: 'Email', required: true },
        { name: 'password', label: 'Mot de passe (vide = inchangé)', type: 'password' },
        { name: 'role', label: 'Rôle', type: 'select', options: ROLES, required: true },
        { name: 'actif', label: 'Compte actif', type: 'checkbox' },
      ]}
      initial={{ name: '', email: '', password: '', role: 'agent', actif: true }}
      filters={({ params, setParams }) => (
        <Select value={params.role ?? ''} onChange={(e) => setParams({ ...params, role: e.target.value })} className="w-56">
          <option value="">Tous les rôles</option>
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </Select>
      )}
    />
  )
}
