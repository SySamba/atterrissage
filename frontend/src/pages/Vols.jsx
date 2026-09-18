import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { Btn, Card, ErrorMsg, Field, Input, PageHeader, Pagination, Select, Table } from '../components/ui'

const fmt = (n) => Number(n ?? 0).toLocaleString('fr-FR')

export default function Vols() {
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [compagnies, setCompagnies] = useState([])
  const [natures, setNatures] = useState([])
  const [filters, setFilters] = useState({ numero: '', compagnie_id: '', nature_vol_id: '', date_debut: '', date_fin: '' })
  const first = useRef(true)

  useEffect(() => {
    api.get('/compagnies').then((r) => setCompagnies(r.data))
    api.get('/nature-vols').then((r) => setNatures(r.data))
  }, [])

  const load = (p = page, f = filters) => {
    const params = { ...Object.fromEntries(Object.entries(f).filter(([, v]) => v !== '')), page: p }
    api.get('/vols', { params })
      .then((r) => { setRows(r.data.data ?? r.data); setMeta(r.data.current_page ? r.data : null) })
      .catch(setError)
  }

  // Filtres automatiques : rechargement à chaque changement (léger délai pour la saisie)
  useEffect(() => {
    if (first.current) { first.current = false; load(1); return }
    const t = setTimeout(() => { setPage(1); load(1) }, 350)
    return () => clearTimeout(t)
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(page) }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (v) => {
    if (!window.confirm(`Supprimer le vol ${v.numero} et ses escales ?`)) return
    await api.delete(`/vols/${v.id}`)
    load()
  }

  const resume = (v) => {
    const legs = (v.escales ?? []).map((e) => `${e.aeroport_depart?.code ?? '?'}→${e.aeroport_arrivee?.code ?? '?'}`)
    return legs.join(' · ') || '—'
  }

  const totaux = (v) => {
    const es = v.escales ?? []
    return {
      pax: es.reduce((s, e) => s + Number(e.pax_embarques ?? 0) + Number(e.pax_debarques ?? 0), 0),
      fret: es.reduce((s, e) => s + Number(e.fret ?? 0), 0),
    }
  }

  return (
    <div>
      <PageHeader
        title="Vols"
        subtitle="Saisie des mouvements et du trafic par escale — alimente le tableau de bord"
        actions={<Link to="/vols/nouveau"><Btn>+ Saisir un vol</Btn></Link>}
      />
      <ErrorMsg error={error} />

      <Card className="mb-5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Field label="N° de vol"><Input placeholder="Rechercher…" value={filters.numero} onChange={(e) => setFilters({ ...filters, numero: e.target.value })} /></Field>
          <Field label="Compagnie">
            <Select value={filters.compagnie_id} onChange={(e) => setFilters({ ...filters, compagnie_id: e.target.value })}>
              <option value="">Toutes</option>
              {compagnies.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </Select>
          </Field>
          <Field label="Nature">
            <Select value={filters.nature_vol_id} onChange={(e) => setFilters({ ...filters, nature_vol_id: e.target.value })}>
              <option value="">Toutes</option>
              {natures.map((n) => <option key={n.id} value={n.id}>{n.libelle}</option>)}
            </Select>
          </Field>
          <Field label="Du"><Input type="date" value={filters.date_debut} onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })} /></Field>
          <Field label="Au"><Input type="date" value={filters.date_fin} onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })} /></Field>
        </div>
      </Card>

      <Card>
        <Table
          columns={[
            { key: 'numero', label: 'N° vol', render: (v) => <span className="font-semibold">{v.numero}</span> },
            { key: 'date_vol', label: 'Date', render: (v) => v.date_vol?.slice(0, 10) },
            { key: 'compagnie', label: 'Compagnie', render: (v) => v.compagnie?.nom ?? '—' },
            { key: 'aeronef', label: 'Aéronef', render: (v) => v.aeronef ? `${v.aeronef.immatriculation}${v.aeronef.modele ? ` (${v.aeronef.modele})` : ''}` : '—' },
            { key: 'nature', label: 'Nature', render: (v) => v.nature_vol?.libelle ?? '—' },
            { key: 'trajet', label: 'Trajet', render: resume },
            { key: 'pax', label: 'PAX', render: (v) => fmt(totaux(v).pax) },
            { key: 'fret', label: 'Fret (kg)', render: (v) => fmt(totaux(v).fret) },
            {
              key: '_a', label: 'Actions', render: (v) => (
                <div className="flex gap-2">
                  <Link to={`/vols/${v.id}/modifier`}><Btn variant="secondary" className="!py-1 !px-2 text-xs">Modifier</Btn></Link>
                  <Btn variant="danger" className="!py-1 !px-2 text-xs" onClick={() => remove(v)}>Suppr.</Btn>
                </div>
              ),
            },
          ]}
          rows={rows}
          empty="Aucun vol saisi — utilisez « + Saisir un vol » pour alimenter les statistiques"
        />
        <Pagination meta={meta} onPage={setPage} />
      </Card>
    </div>
  )
}
