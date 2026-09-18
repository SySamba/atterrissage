import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../auth'
import { downloadFile } from '../download'
import { DETAIL_LABELS, DOC_LABELS } from './DemandeForm'
import { Badge, Btn, Card, ErrorMsg, Field, Input, Modal, PageHeader, Pagination, Select, Table } from '../components/ui'

export const STATUTS = {
  en_attente: { label: 'En attente', color: 'amber' },
  autorisee: { label: 'Autorisée', color: 'green' },
  refusee: { label: 'Refusée', color: 'red' },
  annulee: { label: 'Annulée', color: 'slate' },
}

const TYPES = { survol: 'Survol', atterrissage: 'Atterrissage', survol_atterrissage: 'Survol + Atterrissage' }
const DEMANDEURS = { compagnie: 'Compagnie aérienne', operateur: 'Opérateur', representant_diplomatique: 'Représentant diplomatique' }

export default function Demandes() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [filters, setFilters] = useState({ statut: '', type: '', demandeur_type: '', date_debut: '', date_fin: '', search: '' })
  const [error, setError] = useState(null)
  const [traitement, setTraitement] = useState(null)
  const [decision, setDecision] = useState({ statut: 'autorisee', motif_refus: '', montant_facture: '' })
  const [detail, setDetail] = useState(null)
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)

  const load = (p = page) => {
    const params = { ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')), page: p }
    api.get('/demandes', { params })
      .then((r) => { setRows(r.data.data ?? r.data); setMeta(r.data.current_page ? r.data : null) })
      .catch(setError)
  }

  useEffect(() => { load() }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const openTraitement = (d) => {
    setTraitement(d)
    setDecision({ statut: 'autorisee', motif_refus: '', montant_facture: '' })
    setError(null)
  }

  const traiter = async () => {
    try {
      await api.post(`/demandes/${traitement.id}/traiter`, {
        statut: decision.statut,
        motif_refus: decision.motif_refus || null,
        montant_facture: decision.montant_facture === '' ? null : decision.montant_facture,
      })
      setTraitement(null)
      load()
    } catch (err) {
      setError(err)
    }
  }

  const remove = async (d) => {
    if (!window.confirm(`Supprimer la demande ${d.numero} ?`)) return
    await api.delete(`/demandes/${d.id}`)
    load()
  }

  return (
    <div>
      <PageHeader
        title="Demandes de survol / atterrissage"
        subtitle="Enregistrement et traitement des demandes d'autorisation (bureau survol)"
        actions={<Link to="/demandes/nouvelle"><Btn>+ Nouvelle demande</Btn></Link>}
      />
      <ErrorMsg error={error} />

      <Card className="mb-5">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Field label="Recherche"><Input placeholder="N°, immatriculation…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></Field>
          <Field label="Statut">
            <Select value={filters.statut} onChange={(e) => setFilters({ ...filters, statut: e.target.value })}>
              <option value="">Tous</option>
              {Object.entries(STATUTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
            </Select>
          </Field>
          <Field label="Type">
            <Select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">Tous</option>
              {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Demandeur">
            <Select value={filters.demandeur_type} onChange={(e) => setFilters({ ...filters, demandeur_type: e.target.value })}>
              <option value="">Tous</option>
              {Object.entries(DEMANDEURS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Du"><Input type="date" value={filters.date_debut} onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })} /></Field>
          <Field label="Au"><Input type="date" value={filters.date_fin} onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })} /></Field>
        </div>
        <div className="mt-3 flex gap-2">
          <Btn onClick={() => { setPage(1); load(1) }}>Filtrer</Btn>
          <Btn variant="secondary" onClick={() => { setFilters({ statut: '', type: '', demandeur_type: '', date_debut: '', date_fin: '', search: '' }); setPage(1); setTimeout(() => load(1), 0) }}>Réinitialiser</Btn>
        </div>
      </Card>

      <Card>
        <Table
          columns={[
            { key: 'numero', label: 'N° demande', render: (d) => <span className="font-semibold">{d.numero}</span> },
            { key: 'created_at', label: 'Déposée le', render: (d) => d.created_at?.slice(0, 10) },
            { key: 'demandeur', label: 'Demandeur', render: (d) => d.demandeur_libelle },
            { key: 'demandeur_type', label: 'Type demandeur', render: (d) => DEMANDEURS[d.demandeur_type] },
            { key: 'type', label: 'Autorisation', render: (d) => TYPES[d.type] },
            { key: 'trajet', label: 'Trajet', render: (d) => `${d.aeroport_provenance?.code ?? '-'} → ${d.aeroport_destination?.code ?? '-'}` },
            { key: 'date_vol', label: 'Date vol', render: (d) => d.date_vol?.slice(0, 10) },
            { key: 'statut', label: 'Statut', render: (d) => <Badge color={STATUTS[d.statut].color}>{STATUTS[d.statut].label}</Badge> },
            {
              key: '_a', label: 'Actions', render: (d) => (
                <div className="flex gap-2">
                  <Btn variant="secondary" className="!py-1 !px-2 text-xs" onClick={() => api.get(`/demandes/${d.id}`).then((r) => setDetail(r.data))}>Détails</Btn>
                  <Btn variant="secondary" className="!py-1 !px-2 text-xs" onClick={() => downloadFile(`/demandes/${d.id}/pdf`)}>PDF</Btn>
                  {d.statut === 'autorisee' && <Btn variant="success" className="!py-1 !px-2 text-xs" onClick={() => downloadFile(`/demandes/${d.id}/facture`)}>Facture</Btn>}
                  {d.statut === 'en_attente' && user?.role !== 'demandeur' && <Btn className="!py-1 !px-2 text-xs" onClick={() => openTraitement(d)}>Traiter</Btn>}
                  <Link to={`/demandes/${d.id}/modifier`}><Btn variant="secondary" className="!py-1 !px-2 text-xs">Modifier</Btn></Link>
                  <Btn variant="danger" className="!py-1 !px-2 text-xs" onClick={() => remove(d)}>Suppr.</Btn>
                </div>
              ),
            },
          ]}
          rows={rows}
        />
        <Pagination meta={meta} onPage={setPage} />
      </Card>

      {/* Modal traitement par le bureau survol */}
      <Modal open={!!traitement} onClose={() => setTraitement(null)} title={`Traitement — ${traitement?.numero}`}>
        <ErrorMsg error={error} />
        <div className="text-sm text-slate-600 mb-4">
          <div><b>Demandeur :</b> {traitement?.demandeur_libelle}</div>
          <div><b>Type :</b> {traitement && TYPES[traitement.type]}</div>
          <div><b>Trajet :</b> {traitement?.aeroport_provenance?.code} → {traitement?.aeroport_destination?.code} le {traitement?.date_vol?.slice(0, 10)}</div>
          <div><b>Aéronef :</b> {traitement?.immatriculation} — <b>Fret :</b> {traitement?.poids_fret} kg</div>
        </div>
        <div className="space-y-4">
          <Field label="Décision" required>
            <Select value={decision.statut} onChange={(e) => setDecision({ ...decision, statut: e.target.value })}>
              <option value="autorisee">Autoriser</option>
              <option value="refusee">Refuser</option>
              <option value="annulee">Annuler</option>
            </Select>
          </Field>
          {decision.statut === 'autorisee' && (
            <Field label="Montant facturé (FCFA) — vide = calcul automatique">
              <Input type="number" min="0" value={decision.montant_facture} onChange={(e) => setDecision({ ...decision, montant_facture: e.target.value })} placeholder="Forfait + 50 FCFA/kg de fret" />
            </Field>
          )}
          {decision.statut !== 'autorisee' && (
            <Field label="Motif">
              <Input value={decision.motif_refus} onChange={(e) => setDecision({ ...decision, motif_refus: e.target.value })} />
            </Field>
          )}
          <div className="flex justify-end gap-2">
            <Btn variant="secondary" onClick={() => setTraitement(null)}>Annuler</Btn>
            <Btn variant={decision.statut === 'autorisee' ? 'success' : 'danger'} onClick={traiter}>Valider la décision</Btn>
          </div>
        </div>
      </Modal>

      {/* Modal détails */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Demande ${detail?.numero}`}>
        {detail && (
          <div className="text-sm space-y-2 text-slate-700">
            <div><b>Déposée le :</b> {detail.created_at?.slice(0, 10)}</div>
            <div><b>Demandeur :</b> {detail.demandeur_libelle} ({DEMANDEURS[detail.demandeur_type]})</div>
            <div><b>Objet :</b> {detail.objet ?? '-'}</div>
            <div><b>Type :</b> {TYPES[detail.type]}</div>
            <div><b>Nature du vol :</b> {detail.nature_vol?.libelle ?? '-'}</div>
            {detail.numero_vol && <div><b>N° de vol :</b> {detail.numero_vol}</div>}
            <div><b>Aéronef :</b> {detail.immatriculation} {detail.type_aeronef ? `(${detail.type_aeronef})` : ''}</div>
            <div><b>Provenance :</b> {detail.aeroport_provenance?.nom ?? '-'}</div>
            <div><b>Destination :</b> {detail.aeroport_destination?.nom ?? '-'}</div>
            <div><b>Date du vol :</b> {detail.date_vol?.slice(0, 10)}</div>
            <div><b>Poids fret :</b> {detail.poids_fret} kg</div>
            {detail.details && Object.keys(DETAIL_LABELS).filter((k) => detail.details[k]).length > 0 && (
              <div className="border-t border-slate-200 pt-2 mt-2">
                <b>Détails du vol :</b>
                {Object.entries(DETAIL_LABELS).map(([k, label]) => detail.details[k] ? (
                  <div key={k} className="pl-3"><span className="text-slate-500">{label} :</span> {detail.details[k]}</div>
                ) : null)}
              </div>
            )}
            {detail.documents?.length > 0 && (
              <div className="border-t border-slate-200 pt-2 mt-2">
                <b>Pièces jointes :</b>
                {detail.documents.map((doc) => (
                  <div key={doc.id} className="pl-3">
                    <span className="text-slate-500">{DOC_LABELS[doc.champ] ?? doc.champ} :</span>{' '}
                    <button className="text-blue-800 underline" onClick={() => downloadFile(`/demandes/${detail.id}/documents/${doc.id}`)}>{doc.nom_original}</button>
                  </div>
                ))}
              </div>
            )}
            <div><b>Statut :</b> <Badge color={STATUTS[detail.statut].color}>{STATUTS[detail.statut].label}</Badge></div>
            {detail.numero_autorisation && <div><b>N° autorisation :</b> {detail.numero_autorisation}</div>}
            {detail.montant_facture != null && <div><b>Facture :</b> {Number(detail.montant_facture).toLocaleString('fr-FR')} FCFA</div>}
            {detail.motif_refus && <div><b>Motif :</b> {detail.motif_refus}</div>}
            {detail.traite_par && <div><b>Traité par :</b> {detail.traite_par.name} le {detail.date_traitement?.slice(0, 10)}</div>}
            {detail.observations && <div><b>Observations :</b> {detail.observations}</div>}
            <div className="flex gap-2 pt-3">
              <Btn variant="secondary" onClick={() => downloadFile(`/demandes/${detail.id}/pdf`)}>Fiche PDF</Btn>
              {detail.statut === 'autorisee' && (
                <Btn variant="success" onClick={() => downloadFile(`/demandes/${detail.id}/facture`)}>Facture PDF</Btn>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
