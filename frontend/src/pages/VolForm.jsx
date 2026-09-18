import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import QuickCreateSelect from '../components/QuickCreateSelect'
import { Btn, Card, ErrorMsg, Field, Input, PageHeader, Select } from '../components/ui'

const ESCALE_VIDE = {
  aeroport_depart_id: '', aeroport_arrivee_id: '',
  pax_embarques: '', pax_debarques: '', pax_effectifs: '', pax_transit: '',
  billets_gratuits: '', bebes: '', pax_redevance: '', poste: '', fret: '', observations: '',
}

const COMPAGNIE_FIELDS = [
  { name: 'nom', label: 'Nom de la compagnie', required: true },
  { name: 'code_iata', label: 'Code IATA' },
  { name: 'code_oaci', label: 'Code OACI' },
  { name: 'responsable', label: 'Responsable' },
  {
    name: 'type', label: 'Type', type: 'select', required: true, default: 'regulier',
    options: [
      { value: 'regulier', label: 'Régulier' },
      { value: 'irregulier', label: 'Irrégulier' },
      { value: 'cargo', label: 'Cargo' },
      { value: 'charter', label: 'Charter' },
    ],
  },
]

export default function VolForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    numero: '', date_vol: '', heure_depart: '', heure_arrivee: '',
    nature_vol_id: '', aeronef_id: '', observations: '',
  })
  const [compagnieSel, setCompagnieSel] = useState('')
  const [escales, setEscales] = useState([{ ...ESCALE_VIDE }])
  const [compagnies, setCompagnies] = useState([])
  const [aeronefs, setAeronefs] = useState([])
  const [natures, setNatures] = useState([])
  const [aeroports, setAeroports] = useState([])
  const [referenceId, setReferenceId] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadRefs = () => {
    api.get('/compagnies').then((r) => setCompagnies(r.data))
    api.get('/aeronefs').then((r) => setAeronefs(r.data))
    api.get('/nature-vols').then((r) => setNatures(r.data))
    api.get('/aeroports').then((r) => setAeroports(r.data))
    api.get('/parametres').then((r) => setReferenceId(r.data.aeroport_reference_id)).catch(() => {})
  }

  useEffect(() => {
    loadRefs()
    if (id) {
      api.get(`/vols/${id}`).then((r) => {
        const v = r.data
        setForm({
          numero: v.numero, date_vol: v.date_vol?.slice(0, 10),
          heure_depart: v.heure_depart?.slice(0, 5) ?? '', heure_arrivee: v.heure_arrivee?.slice(0, 5) ?? '',
          nature_vol_id: v.nature_vol_id ?? '', aeronef_id: v.aeronef_id ?? '', observations: v.observations ?? '',
        })
        setCompagnieSel(v.compagnie_id ? String(v.compagnie_id) : '')
        if (v.escales?.length) {
          setEscales(v.escales.map((e) => ({
            aeroport_depart_id: e.aeroport_depart_id, aeroport_arrivee_id: e.aeroport_arrivee_id,
            pax_embarques: e.pax_embarques ?? '', pax_debarques: e.pax_debarques ?? '',
            pax_effectifs: e.pax_effectifs ?? '', pax_transit: e.pax_transit ?? '',
            billets_gratuits: e.billets_gratuits ?? '', bebes: e.bebes ?? '',
            pax_redevance: e.pax_redevance ?? '', poste: e.poste ?? '', fret: e.fret ?? '',
            observations: e.observations ?? '',
          })))
        }
      })
    }
  }, [id])

  const setEscale = (i, key, val) => {
    const next = [...escales]
    next[i] = { ...next[i], [key]: val }
    // PAX redevance uniquement au départ de l'aéroport de référence
    if (key === 'aeroport_depart_id' && referenceId && String(val) !== String(referenceId)) {
      next[i].pax_redevance = ''
    }
    setEscales(next)
  }

  const addEscale = () => setEscales([...escales, { ...ESCALE_VIDE }])
  const removeEscale = (i) => setEscales(escales.filter((_, j) => j !== i))

  const aeronefsFiltres = compagnieSel ? aeronefs.filter((a) => String(a.compagnie_id) === String(compagnieSel)) : aeronefs

  const aeronefFields = [
    { name: 'immatriculation', label: 'Immatriculation', required: true },
    {
      name: 'compagnie_id', label: 'Compagnie', type: 'select', required: true,
      default: compagnieSel || '',
      options: compagnies.map((c) => ({ value: c.id, label: c.nom })),
    },
    { name: 'modele', label: 'Modèle' },
    { name: 'capacite', label: 'Capacité (sièges)', type: 'number' },
  ]

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = {
      ...form,
      nature_vol_id: form.nature_vol_id || null,
      escales: escales
        .filter((es) => es.aeroport_depart_id && es.aeroport_arrivee_id)
        .map((es) => Object.fromEntries(Object.entries(es).map(([k, v]) => [k, v === '' ? null : v]))),
    }
    try {
      if (id) await api.put(`/vols/${id}`, payload)
      else await api.post('/vols', payload)
      navigate('/vols')
    } catch (err) {
      setError(err)
      setSaving(false)
    }
  }

  const numField = (i, key, label, props = {}) => (
    <Field label={label}>
      <Input type="number" min="0" value={escales[i][key]} onChange={(e) => setEscale(i, key, e.target.value)} {...props} />
    </Field>
  )

  return (
    <div>
      <PageHeader
        title={id ? `Modifier le vol` : 'Saisie d\'un vol'}
        subtitle="Mouvements et trafic par escale — alimente les statistiques du tableau de bord"
        actions={<Link to="/vols"><Btn variant="secondary">← Retour à la liste</Btn></Link>}
      />
      <ErrorMsg error={error} />

      <form onSubmit={submit}>
        <Card title="Informations du vol" className="mb-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="N° de vol" required>
              <Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} required placeholder="ex : THE102" />
            </Field>
            <Field label="Date du vol" required>
              <Input type="date" value={form.date_vol} onChange={(e) => setForm({ ...form, date_vol: e.target.value })} required />
            </Field>
            <Field label="Heure départ">
              <Input type="time" value={form.heure_depart} onChange={(e) => setForm({ ...form, heure_depart: e.target.value })} />
            </Field>
            <Field label="Heure arrivée">
              <Input type="time" value={form.heure_arrivee} onChange={(e) => setForm({ ...form, heure_arrivee: e.target.value })} />
            </Field>
            <Field label="Compagnie">
              <QuickCreateSelect
                value={compagnieSel}
                onChange={(v) => { setCompagnieSel(v); setForm({ ...form, aeronef_id: '' }) }}
                options={compagnies.map((c) => ({ id: c.id, label: `${c.nom}${c.code_iata ? ` (${c.code_iata})` : ''}` }))}
                endpoint="/compagnies"
                fields={COMPAGNIE_FIELDS}
                createTitle="Nouvelle compagnie"
                placeholder="Toutes"
              />
            </Field>
            <Field label="Aéronef" required>
              <QuickCreateSelect
                value={String(form.aeronef_id)}
                onChange={(v, created) => {
                  setForm({ ...form, aeronef_id: v })
                  if (created) setAeronefs([...aeronefs, created])
                }}
                options={aeronefsFiltres.map((a) => ({ id: a.id, label: `${a.immatriculation}${a.modele ? ` — ${a.modele}` : ''}` }))}
                endpoint="/aeronefs"
                fields={aeronefFields}
                createTitle="Nouvel aéronef"
                placeholder="— Choisir —"
                required
              />
            </Field>
            <Field label="Nature de vol">
              <QuickCreateSelect
                value={String(form.nature_vol_id)}
                onChange={(v, created) => {
                  setForm({ ...form, nature_vol_id: v })
                  if (created) setNatures([...natures, created])
                }}
                options={natures.map((n) => ({ id: n.id, label: n.libelle }))}
                endpoint="/nature-vols"
                fields={[{ name: 'libelle', label: 'Libellé', required: true }]}
                createTitle="Nouvelle nature de vol"
                placeholder="— Choisir —"
              />
            </Field>
            <Field label="Observations">
              <Input value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} />
            </Field>
          </div>
        </Card>

        <Card
          title="Escales et trafic"
          actions={<Btn type="button" variant="secondary" onClick={addEscale}>+ Ajouter une escale</Btn>}
          className="mb-5"
        >
          {escales.map((es, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4 mb-4 bg-slate-50/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-600">Escale {i + 1}</span>
                {escales.length > 1 && (
                  <Btn type="button" variant="danger" className="!py-1 !px-2 text-xs" onClick={() => removeEscale(i)}>Retirer</Btn>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <Field label="Aéroport de départ" required>
                  <Select value={es.aeroport_depart_id} onChange={(e) => setEscale(i, 'aeroport_depart_id', e.target.value)} required>
                    <option value="">—</option>
                    {aeroports.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.ville}</option>)}
                  </Select>
                </Field>
                <Field label="Aéroport d'arrivée" required>
                  <Select value={es.aeroport_arrivee_id} onChange={(e) => setEscale(i, 'aeroport_arrivee_id', e.target.value)} required>
                    <option value="">—</option>
                    {aeroports.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.ville}</option>)}
                  </Select>
                </Field>
                {numField(i, 'fret', 'Fret (kg)', { step: '0.01' })}
                {numField(i, 'poste', 'Poste (kg)', { step: '0.01' })}
              </div>
              <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                {numField(i, 'pax_embarques', 'PAX embarqués')}
                {numField(i, 'pax_debarques', 'PAX débarqués')}
                {numField(i, 'pax_effectifs', 'PAX effectifs')}
                {numField(i, 'pax_transit', 'Transit')}
                {numField(i, 'billets_gratuits', 'Billets gratuits')}
                {numField(i, 'bebes', 'Bébés')}
                <Field label="PAX redevance">
                  <Input
                    type="number" min="0"
                    value={es.pax_redevance}
                    onChange={(e) => setEscale(i, 'pax_redevance', e.target.value)}
                    disabled={referenceId && String(es.aeroport_depart_id) !== String(referenceId)}
                    title={referenceId && String(es.aeroport_depart_id) !== String(referenceId) ? 'Uniquement au départ de l\'aéroport de référence (N\'Djamena)' : ''}
                    className="disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </Field>
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-400">
            « PAX redevance » n'est saisissable qu'au départ de l'aéroport de référence (redevance aviation civile).
          </p>
        </Card>

        <div className="flex justify-end gap-2">
          <Link to="/vols"><Btn variant="secondary" type="button">Annuler</Btn></Link>
          <Btn type="submit" disabled={saving}>{saving ? 'Enregistrement…' : id ? 'Mettre à jour' : 'Enregistrer le vol'}</Btn>
        </div>
      </form>
    </div>
  )
}
