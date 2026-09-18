import CrudPage from '../components/CrudPage'

export default function Aeroports() {
  return (
    <CrudPage
      title="Aéroports"
      subtitle="Aéroports de provenance et de destination"
      endpoint="/aeroports"
      columns={[
        { key: 'code', label: 'Code', render: (a) => <span className="font-semibold">{a.code}</span> },
        { key: 'nom', label: 'Nom' },
        { key: 'ville', label: 'Ville' },
        { key: 'pays', label: 'Pays' },
      ]}
      fields={[
        { name: 'code', label: 'Code IATA', required: true },
        { name: 'nom', label: 'Nom de l\'aéroport', required: true },
        { name: 'ville', label: 'Ville', required: true },
        { name: 'pays', label: 'Pays', required: true },
      ]}
      initial={{ code: '', nom: '', ville: '', pays: '' }}
    />
  )
}
