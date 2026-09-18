import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import QuickCreateSelect from '../components/QuickCreateSelect'
import { downloadFile } from '../download'
import { Btn, Card, ErrorMsg, Field, Input, PageHeader, Select } from '../components/ui'

const initial = {
  type: 'survol_atterrissage', demandeur_type: 'compagnie', compagnie_id: '', representant_id: '',
  demandeur_nom: '', objet: '', numero_vol: '', nature_vol_id: '', immatriculation: '', type_aeronef: '',
  aeroport_provenance_id: '', aeroport_destination_id: '', date_vol: '', poids_fret: 0, observations: '',
}

const COMPAGNIE_FIELDS = [
  { name: 'nom', label: 'Nom de la compagnie', required: true },
  { name: 'code_iata', label: 'Code IATA' },
  { name: 'code_oaci', label: 'Code OACI' },
  { name: 'responsable', label: 'Responsable' },
  {
    name: 'type', label: 'Type', type: 'select', required: true, default: 'regulier',
    options: [
      { value: 'regulier', label: 'Régulière' },
      { value: 'irregulier', label: 'Irrégulière' },
      { value: 'cargo', label: 'Cargo' },
      { value: 'charter', label: 'Charter' },
    ],
  },
]

const REPRESENTANT_FIELDS = [
  { name: 'nom', label: 'Nom du représentant', required: true },
  { name: 'organisme', label: 'Organisme' },
  { name: 'telephone', label: 'Téléphone' },
  { name: 'email', label: 'Email' },
  { name: 'adresse', label: 'Adresse' },
]

const NATURE_FIELDS = [{ name: 'libelle', label: 'Libellé', required: true }]

const AEROPORT_FIELDS = [
  { name: 'code', label: 'Code (IATA/OACI)', required: true },
  { name: 'nom', label: "Nom de l'aéroport", required: true },
  { name: 'ville', label: 'Ville', required: true },
  { name: 'pays', label: 'Pays', required: true },
]

export const DOC_LABELS = {
  docs_compagnie: "Documents de la compagnie (agrément, PEA, spécifications opérationnelles)",
  docs_aeronef: "Documents des aéronefs (immatriculation, navigabilité, licences station, assurance)",
  lettre_introduction: "Lettre d'introduction et contrat de l'organisme officiel",
  avis_ministres: "Avis favorables des ministres (Intérieur, Forces Armées, Communication)",
  certificat_travail: "Certificat de travail aérien",
}

// Libellés des champs complémentaires (identiques au backend)
export const DETAIL_LABELS = {
  itineraire: 'Itinéraire complet',
  date_depart: 'Date de départ',
  heure_arrivee: "Heure estimée d'arrivée",
  heure_depart: 'Heure estimée de départ',
  nature_cargaison: 'Nature de la cargaison',
  quantite_cargaison: 'Quantité de cargaison',
  masse_cargaison: 'Masse de la cargaison (kg)',
  affreteur: 'Affréteur',
  destinataire: 'Destinataire',
  nombre_vols: 'Nombre de vols',
  periode: 'Période',
  partenaires_senegal: 'Partenaires au Sénégal',
  hebergement_passagers: "Site d'hébergement des passagers",
  representant_senegal: 'Représentant au Sénégal',
  nature_navigabilite: 'Certificat de navigabilité',
  validite_navigabilite: 'Validité navigabilité',
  reference_assurance: "Police d'assurance",
  validite_assurance: "Validité de l'assurance",
  proprietaire_exploitant: 'Propriétaire / exploitant',
  licences_equipage: "Licences d'équipage",
  zones_evolution: "Zones d'évolution et altitudes",
  equipements_aeronef: 'Équipements des aéronefs',
  autres_autorisations: 'Autres autorisations',
  nombre_passagers: 'Nombre de passagers',
  passagers_details: 'Identité des passagers',
  equipements_bord: 'Équipements à bord',
  but_atterrissage: "But de l'atterrissage",
}

// Champs exigés par nature de vol (code de nature_vols)
const NAVIGABILITE = [
  { name: 'nature_navigabilite', label: 'Nature du certificat de navigabilité', required: true },
  { name: 'validite_navigabilite', label: 'Limite de validité (navigabilité)', type: 'date', required: true },
  { name: 'reference_assurance', label: "Références de la police d'assurance", required: true },
  { name: 'validite_assurance', label: "Limite de validité de l'assurance", type: 'date', required: true },
]
const HEURES = [
  { name: 'heure_arrivee', label: "Heure estimée d'arrivée", type: 'time', required: true },
  { name: 'heure_depart', label: 'Heure estimée de départ', type: 'time', required: true },
  { name: 'date_depart', label: 'Date de départ', type: 'date' },
]
const CARGAISON = [
  { name: 'nature_cargaison', label: 'Nature de la cargaison', required: true },
  { name: 'quantite_cargaison', label: 'Quantité', type: 'number' },
  { name: 'masse_cargaison', label: 'Masse (kg)', type: 'number' },
]

const NATURE_SCHEMAS = {
  commercial: {
    champs: [
      { name: 'itineraire', label: 'Itinéraire complet', required: true, span: 2 },
      ...HEURES,
      { name: 'nature_cargaison', label: 'Nature de la cargaison', required: true },
      { name: 'affreteur', label: 'Affréteur', required: true },
      { name: 'destinataire', label: 'Destinataire', required: true },
      { name: 'nombre_vols', label: 'Nombre de vols', type: 'number', required: true },
      { name: 'periode', label: 'Période', required: true },
      { name: 'partenaires_senegal', label: 'Partenaires au Sénégal' },
      { name: 'hebergement_passagers', label: "Site prévu pour l'hébergement des passagers" },
      { name: 'representant_senegal', label: 'Représentant au Sénégal (nom et adresse complète)', type: 'textarea', required: true, span: 3 },
    ],
    docs: ['docs_compagnie', 'docs_aeronef'],
  },
  diplomatique: {
    champs: [
      { name: 'proprietaire_exploitant', label: "Nom du propriétaire et/ou de l'exploitant", required: true },
      ...NAVIGABILITE,
      { name: 'licences_equipage', label: "Licences des membres d'équipage", type: 'textarea', required: true, span: 3 },
      { name: 'itineraire', label: 'Itinéraire complet', required: true, span: 2 },
      ...HEURES,
      ...CARGAISON,
      { name: 'affreteur', label: 'Affréteur', required: true },
      { name: 'destinataire', label: 'Destinataire', required: true },
      { name: 'but_atterrissage', label: "But de l'atterrissage", required: true },
    ],
    docs: [],
  },
  travail: {
    champs: [
      { name: 'proprietaire_exploitant', label: "Nom du propriétaire et/ou de l'exploitant", required: true },
      ...NAVIGABILITE,
      { name: 'licences_equipage', label: "Licences des membres d'équipage", type: 'textarea', required: true, span: 3 },
      { name: 'itineraire', label: 'Itinéraire complet', required: true, span: 2 },
      ...HEURES,
      { name: 'affreteur', label: 'Affréteur', required: true },
      { name: 'destinataire', label: 'Destinataire', required: true },
      { name: 'zones_evolution', label: "Zones d'évolution et altitudes", required: true },
      { name: 'equipements_aeronef', label: 'Équipements spécifiques des aéronefs utilisés' },
      { name: 'autres_autorisations', label: 'Autres autorisations obtenues' },
    ],
    docs: ['lettre_introduction', 'avis_ministres', 'certificat_travail'],
  },
  prive: {
    champs: [
      { name: 'proprietaire_exploitant', label: "Nom du propriétaire et/ou de l'exploitant", required: true },
      ...NAVIGABILITE,
      { name: 'licences_equipage', label: "Licences des membres d'équipage", type: 'textarea', required: true, span: 3 },
      { name: 'nombre_passagers', label: 'Nombre de passagers', type: 'number', required: true },
      { name: 'passagers_details', label: 'Identité et qualité des passagers à bord', type: 'textarea', required: true, span: 3 },
      { name: 'itineraire', label: 'Itinéraire complet', required: true, span: 2 },
      ...HEURES,
      ...CARGAISON,
      { name: 'equipements_bord', label: 'Équipements à bord (prises de vues aériennes, etc.)' },
      { name: 'affreteur', label: 'Affréteur', required: true },
      { name: 'destinataire', label: 'Destinataire', required: true },
      { name: 'but_atterrissage', label: "But de l'atterrissage", required: true },
    ],
    docs: [],
  },
}

export default function DemandeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [refs, setRefs] = useState({ compagnies: [], representants: [], natures: [], aeroports: [] })
  const [form, setForm] = useState(initial)
  const [details, setDetails] = useState({})
  const [files, setFiles] = useState({})
  const [docsExistants, setDocsExistants] = useState([])
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/compagnies'),
      api.get('/representants'),
      api.get('/nature-vols'),
      api.get('/aeroports'),
    ]).then(([c, r, n, a]) => setRefs({ compagnies: c.data, representants: r.data, natures: n.data, aeroports: a.data }))
  }, [])

  useEffect(() => {
    if (!id) return
    api.get(`/demandes/${id}`).then((r) => {
      const d = r.data
      setForm({
        type: d.type, demandeur_type: d.demandeur_type,
        compagnie_id: d.compagnie_id ?? '', representant_id: d.representant_id ?? '',
        demandeur_nom: d.demandeur_nom ?? '', objet: d.objet ?? '', numero_vol: d.numero_vol ?? '',
        nature_vol_id: d.nature_vol_id ?? '', immatriculation: d.immatriculation ?? '',
        type_aeronef: d.type_aeronef ?? '',
        aeroport_provenance_id: d.aeroport_provenance_id ?? '',
        aeroport_destination_id: d.aeroport_destination_id ?? '',
        date_vol: d.date_vol?.slice(0, 10) ?? '', poids_fret: d.poids_fret ?? 0,
        observations: d.observations ?? '',
      })
      setDetails(d.details ?? {})
      setDocsExistants(d.documents ?? [])
    })
  }, [id])

  const nature = refs.natures.find((n) => String(n.id) === String(form.nature_vol_id))
  const schema = nature ? NATURE_SCHEMAS[nature.code] : null
  const numeroVolRequis = ['diplomatique', 'travail', 'prive'].includes(nature?.code)

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const fd = new FormData()
      const payload = { ...form }
      ;['compagnie_id', 'representant_id', 'nature_vol_id', 'aeroport_provenance_id', 'aeroport_destination_id', 'date_vol'].forEach((k) => {
        if (payload[k] === '') payload[k] = null
      })
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v ?? ''))
      Object.entries(details).forEach(([k, v]) => { if (v !== '' && v != null) fd.append(`details[${k}]`, v) })
      Object.entries(files).forEach(([champ, list]) => [...list].forEach((f) => fd.append(`documents[${champ}][]`, f)))
      if (id) {
        fd.append('_method', 'PUT')
        await api.post(`/demandes/${id}`, fd)
      } else {
        await api.post('/demandes', fd)
      }
      navigate('/demandes')
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
  }

  const supprimerDoc = async (doc) => {
    if (!window.confirm(`Supprimer la pièce « ${doc.nom_original} » ?`)) return
    await api.delete(`/demandes/${id}/documents/${doc.id}`)
    setDocsExistants(docsExistants.filter((d) => d.id !== doc.id))
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const setDetail = (k) => (e) => setDetails({ ...details, [k]: e.target.value })

  return (
    <div>
      <PageHeader title={id ? 'Modifier la demande' : 'Nouvelle demande d\'autorisation'} subtitle="Demande de survol et/ou d'atterrissage" />
      <ErrorMsg error={error} />

      <form onSubmit={save}>
        <Card title="Type d'autorisation et demandeur" className="mb-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Type d'autorisation" required>
              <Select value={form.type} onChange={set('type')} required>
                <option value="survol">Survol</option>
                <option value="atterrissage">Atterrissage</option>
                <option value="survol_atterrissage">Survol + Atterrissage</option>
              </Select>
            </Field>
            <Field label="Type de demandeur" required>
              <Select value={form.demandeur_type} onChange={set('demandeur_type')} required>
                <option value="compagnie">Compagnie aérienne</option>
                <option value="operateur">Opérateur de transport aérien</option>
                <option value="representant_diplomatique">Représentant diplomatique</option>
              </Select>
            </Field>
            {form.demandeur_type === 'compagnie' && (
              <Field label="Compagnie aérienne" required>
                <QuickCreateSelect
                  value={form.compagnie_id} required
                  onChange={(cid, item) => {
                    setForm({ ...form, compagnie_id: cid })
                    if (item) setRefs((r) => ({ ...r, compagnies: [...r.compagnies, item] }))
                  }}
                  options={refs.compagnies.map((c) => ({ id: c.id, label: c.nom }))}
                  endpoint="/compagnies"
                  fields={COMPAGNIE_FIELDS}
                  createTitle="Nouvelle compagnie aérienne"
                />
              </Field>
            )}
            {form.demandeur_type === 'representant_diplomatique' && (
              <Field label="Représentant agréé" required>
                <QuickCreateSelect
                  value={form.representant_id} required
                  onChange={(rid, item) => {
                    setForm({ ...form, representant_id: rid })
                    if (item) setRefs((r) => ({ ...r, representants: [...r.representants, item] }))
                  }}
                  options={refs.representants.map((r) => ({ id: r.id, label: r.nom }))}
                  endpoint="/representants"
                  fields={REPRESENTANT_FIELDS}
                  createTitle="Nouveau représentant agréé"
                />
              </Field>
            )}
            {form.demandeur_type === 'operateur' && (
              <Field label="Nom du demandeur" required>
                <Input value={form.demandeur_nom} onChange={set('demandeur_nom')} required />
              </Field>
            )}
            <Field label="Objet de la demande" required={numeroVolRequis}>
              <Input value={form.objet} onChange={set('objet')} required={numeroVolRequis} />
            </Field>
          </div>
        </Card>

        <Card title="Vol concerné" className="mb-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Nature du vol" required>
              <QuickCreateSelect
                value={form.nature_vol_id} required
                onChange={(nid, item) => {
                  setForm({ ...form, nature_vol_id: nid })
                  setDetails({})
                  if (item) setRefs((r) => ({ ...r, natures: [...r.natures, item] }))
                }}
                options={refs.natures.map((n) => ({ id: n.id, label: n.libelle }))}
                endpoint="/nature-vols"
                fields={NATURE_FIELDS}
                createTitle="Nouvelle nature de vol"
              />
            </Field>
            <Field label="Numéro de vol" required={numeroVolRequis}>
              <Input value={form.numero_vol} onChange={set('numero_vol')} required={numeroVolRequis} />
            </Field>
            <Field label="Immatriculation" required={!!schema}>
              <Input value={form.immatriculation} onChange={set('immatriculation')} required={!!schema} />
            </Field>
            <Field label="Type d'aéronef" required={!!schema}>
              <Input value={form.type_aeronef} onChange={set('type_aeronef')} required={!!schema} />
            </Field>
            <Field label="Aéroport de provenance" required={!!schema}>
              <QuickCreateSelect
                value={form.aeroport_provenance_id} required={!!schema}
                onChange={(aid, item) => {
                  setForm({ ...form, aeroport_provenance_id: aid })
                  if (item) setRefs((r) => ({ ...r, aeroports: [...r.aeroports, item] }))
                }}
                options={refs.aeroports.map((a) => ({ id: a.id, label: `${a.code} — ${a.ville}` }))}
                endpoint="/aeroports"
                fields={AEROPORT_FIELDS}
                createTitle="Nouvel aéroport"
              />
            </Field>
            <Field label="Aéroport de destination" required={!!schema}>
              <QuickCreateSelect
                value={form.aeroport_destination_id} required={!!schema}
                onChange={(aid, item) => {
                  setForm({ ...form, aeroport_destination_id: aid })
                  if (item) setRefs((r) => ({ ...r, aeroports: [...r.aeroports, item] }))
                }}
                options={refs.aeroports.map((a) => ({ id: a.id, label: `${a.code} — ${a.ville}` }))}
                endpoint="/aeroports"
                fields={AEROPORT_FIELDS}
                createTitle="Nouvel aéroport"
              />
            </Field>
            <Field label="Date du vol" required={!!schema}>
              <Input type="date" value={form.date_vol} onChange={set('date_vol')} required={!!schema} />
            </Field>
            <Field label="Poids du fret (kg)">
              <Input type="number" min="0" value={form.poids_fret} onChange={set('poids_fret')} />
            </Field>
          </div>
        </Card>

        {schema && (
          <Card title={`Éléments requis — ${nature.libelle}`} className="mb-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {schema.champs.map((f) => (
                <Field key={f.name} label={f.label} required={f.required} className={f.span === 2 ? 'col-span-2' : f.span === 3 ? 'col-span-2 md:col-span-3' : ''}>
                  {f.type === 'textarea' ? (
                    <textarea
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      rows={2} value={details[f.name] ?? ''}
                      onChange={setDetail(f.name)} required={f.required}
                    />
                  ) : (
                    <Input
                      type={f.type ?? 'text'} value={details[f.name] ?? ''}
                      onChange={setDetail(f.name)} required={f.required}
                    />
                  )}
                </Field>
              ))}
            </div>

            {schema.docs.length > 0 && (
              <div className="mt-5 border-t border-slate-200 pt-4">
                <div className="text-sm font-semibold text-slate-700 mb-3">Pièces jointes à fournir</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schema.docs.map((champ) => (
                    <Field key={champ} label={DOC_LABELS[champ]}>
                      <input
                        type="file" multiple
                        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-800 hover:file:bg-blue-100"
                        onChange={(e) => setFiles({ ...files, [champ]: e.target.files })}
                      />
                    </Field>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {docsExistants.length > 0 && (
          <Card title="Pièces jointes déposées" className="mb-5">
            <ul className="divide-y divide-slate-100 text-sm">
              {docsExistants.map((doc) => (
                <li key={doc.id} className="py-2 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-slate-500">{DOC_LABELS[doc.champ] ?? doc.champ} : </span>
                    <button type="button" className="text-blue-800 underline" onClick={() => downloadFile(`/demandes/${id}/documents/${doc.id}`)}>
                      {doc.nom_original}
                    </button>
                  </div>
                  <Btn type="button" variant="danger" className="!py-1 !px-2 text-xs" onClick={() => supprimerDoc(doc)}>Suppr.</Btn>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card title="Observations" className="mb-5">
          <Field label="Observations">
            <textarea className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" rows={3} value={form.observations} onChange={set('observations')} />
          </Field>
        </Card>

        <div className="flex justify-end gap-2">
          <Btn type="button" variant="secondary" onClick={() => navigate('/demandes')}>Annuler</Btn>
          <Btn type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer la demande'}</Btn>
        </div>
      </form>
    </div>
  )
}
