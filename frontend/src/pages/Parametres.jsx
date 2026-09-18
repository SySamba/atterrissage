import { useEffect, useState } from 'react'
import api from '../api'
import { Btn, Card, ErrorMsg, Field, Input, PageHeader, Select } from '../components/ui'

export default function Parametres() {
  const [form, setForm] = useState(null)
  const [aeroports, setAeroports] = useState([])
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/parametres').then((r) => setForm(r.data))
    api.get('/aeroports').then((r) => setAeroports(r.data))
  }, [])

  if (!form) return <div className="text-slate-500">Chargement…</div>

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await api.put('/parametres', {
        exploitant: form.exploitant, service: form.service, telephone: form.telephone,
        fax: form.fax, email: form.email, source_donnees: form.source_donnees,
        logo: form.logo, aeroport_reference_id: form.aeroport_reference_id || null,
        tarif_survol: form.tarif_survol, tarif_atterrissage: form.tarif_atterrissage,
        tarif_survol_atterrissage: form.tarif_survol_atterrissage,
      })
      setSaved(true)
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Paramètres de l'application" subtitle="Informations de l'exploitant et aéroport de référence" />
      <ErrorMsg error={error} />
      {saved && <div className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 text-sm mb-4">Paramètres enregistrés.</div>}

      <form onSubmit={save}>
        <Card title="Exploitant">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nom de l'exploitant / autorité">
              <Input value={form.exploitant ?? ''} onChange={set('exploitant')} />
            </Field>
            <Field label="Service chargé des statistiques">
              <Input value={form.service ?? ''} onChange={set('service')} />
            </Field>
            <Field label="Téléphone">
              <Input value={form.telephone ?? ''} onChange={set('telephone')} />
            </Field>
            <Field label="Fax">
              <Input value={form.fax ?? ''} onChange={set('fax')} />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email ?? ''} onChange={set('email')} />
            </Field>
            <Field label="Source des données">
              <Input value={form.source_donnees ?? ''} onChange={set('source_donnees')} />
            </Field>
            <Field label="Aéroport de référence (base des états)">
              <Select value={form.aeroport_reference_id ?? ''} onChange={set('aeroport_reference_id')}>
                <option value="">—</option>
                {aeroports.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.nom}</option>)}
              </Select>
            </Field>
          </div>
        </Card>

        <Card title="Tarifs des autorisations (FCFA)" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Survol">
              <Input type="number" min="0" value={form.tarif_survol ?? ''} onChange={set('tarif_survol')} />
            </Field>
            <Field label="Atterrissage">
              <Input type="number" min="0" value={form.tarif_atterrissage ?? ''} onChange={set('tarif_atterrissage')} />
            </Field>
            <Field label="Survol + Atterrissage">
              <Input type="number" min="0" value={form.tarif_survol_atterrissage ?? ''} onChange={set('tarif_survol_atterrissage')} />
            </Field>
          </div>
          <p className="text-xs text-slate-400 mt-2">Montant forfaitaire facturé lors de l'autorisation, auquel s'ajoute 50 FCFA/kg de fret.</p>
        </Card>

        <div className="flex justify-end mt-4">
          <Btn type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Btn>
        </div>
      </form>
    </div>
  )
}
