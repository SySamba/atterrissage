import CrudPage from '../components/CrudPage'

const TYPES = { regulier: 'Régulier', irregulier: 'Irrégulier', cargo: 'Cargo', charter: 'Charter' }

export default function Compagnies() {
  return (
    <CrudPage
      title="Compagnies aériennes"
      subtitle="Transporteurs desservant le territoire tchadien"
      endpoint="/compagnies"
      columns={[
        { key: 'nom', label: 'Nom', render: (c) => <span className="font-semibold">{c.nom}</span> },
        { key: 'code_iata', label: 'IATA' },
        { key: 'code_oaci', label: 'OACI' },
        { key: 'type', label: 'Type', render: (c) => TYPES[c.type] ?? c.type },
        { key: 'responsable', label: 'Responsable' },
      ]}
      fields={[
        { name: 'nom', label: 'Nom de la compagnie', required: true },
        { name: 'code_iata', label: 'Code IATA' },
        { name: 'code_oaci', label: 'Code OACI' },
        {
          name: 'type', label: 'Type', type: 'select', required: true,
          options: Object.entries(TYPES).map(([value, label]) => ({ value, label })),
        },
        { name: 'responsable', label: 'Responsable' },
      ]}
      initial={{ nom: '', code_iata: '', code_oaci: '', type: 'regulier', responsable: '' }}
    />
  )
}
