import CrudPage from '../components/CrudPage'

export default function NaturesVol() {
  return (
    <CrudPage
      title="Natures de vol"
      subtitle="Typologie des vols (commercial, cargo, humanitaire, État…)"
      endpoint="/nature-vols"
      columns={[{ key: 'libelle', label: 'Libellé' }]}
      fields={[{ name: 'libelle', label: 'Libellé', required: true }]}
      initial={{ libelle: '' }}
    />
  )
}
