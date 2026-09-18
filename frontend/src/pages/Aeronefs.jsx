import { useEffect, useState } from 'react'
import api from '../api'
import CrudPage from '../components/CrudPage'

export default function Aeronefs() {
  const [compagnies, setCompagnies] = useState([])

  useEffect(() => {
    api.get('/compagnies').then((r) => setCompagnies(r.data))
  }, [])

  return (
    <CrudPage
      title="Aéronefs"
      subtitle="Flotte des aéronefs enregistrés par compagnie"
      endpoint="/aeronefs"
      columns={[
        { key: 'immatriculation', label: 'Immatriculation', render: (a) => <span className="font-semibold">{a.immatriculation}</span> },
        { key: 'modele', label: 'Modèle' },
        { key: 'compagnie', label: 'Compagnie', render: (a) => a.compagnie?.nom ?? '—' },
        { key: 'capacite', label: 'Capacité' },
      ]}
      fields={[
        { name: 'immatriculation', label: 'Immatriculation', required: true },
        {
          name: 'compagnie_id', label: 'Compagnie', type: 'select', required: true,
          options: compagnies.map((c) => ({ value: c.id, label: c.nom })),
        },
        { name: 'modele', label: 'Modèle' },
        { name: 'capacite', label: 'Capacité (sièges)', type: 'number' },
        { name: 'observations', label: 'Observations', type: 'textarea' },
      ]}
      initial={{ immatriculation: '', compagnie_id: '', modele: '', capacite: '', observations: '' }}
    />
  )
}
