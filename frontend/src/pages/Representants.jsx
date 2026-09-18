import CrudPage from '../components/CrudPage'
import { Input } from '../components/ui'

export default function Representants() {
  return (
    <CrudPage
      title="Représentants agréés"
      subtitle="Représentants diplomatiques et organismes autorisés à déposer des demandes"
      endpoint="/representants"
      columns={[
        { key: 'nom', label: 'Nom' },
        { key: 'organisme', label: 'Organisme' },
        { key: 'telephone', label: 'Téléphone' },
        { key: 'email', label: 'Email' },
        { key: 'adresse', label: 'Adresse' },
      ]}
      fields={[
        { name: 'nom', label: 'Nom', required: true },
        { name: 'organisme', label: 'Organisme' },
        { name: 'telephone', label: 'Téléphone' },
        { name: 'email', label: 'Email' },
        { name: 'adresse', label: 'Adresse' },
      ]}
      initial={{ nom: '', organisme: '', telephone: '', email: '', adresse: '' }}
      filters={({ params, setParams }) => (
        <Input
          placeholder="Rechercher…"
          value={params.search ?? ''}
          onChange={(e) => setParams({ ...params, search: e.target.value })}
        />
      )}
    />
  )
}
