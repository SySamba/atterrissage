import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { Badge, Btn, Card, Field, Input, Select, Table } from '../components/ui'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, Legend,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

const STATUTS = {
  en_attente: { label: 'En attente', color: 'amber', hex: '#f59e0b' },
  autorisee: { label: 'Autorisée', color: 'green', hex: '#10b981' },
  refusee: { label: 'Refusée', color: 'red', hex: '#ef4444' },
  annulee: { label: 'Annulée', color: 'slate', hex: '#64748b' },
}

const fmt = (n) => Number(n ?? 0).toLocaleString('fr-FR')

const TABS = [
  { key: 'compagnies', label: 'Trafic par compagnie' },
  { key: 'provenance', label: 'Par provenance' },
  { key: 'destination', label: 'Par destination' },
  { key: 'remplissage', label: 'Taux de remplissage' },
  { key: 'repartition', label: 'Part de marché' },
  { key: 'factures', label: 'Factures redevances' },
  { key: 'demandes', label: 'Statistiques ASA' },
  { key: 'aeronefs', label: 'Aéronefs par aéroport' },
]

const ENDPOINTS = {
  compagnies: '/stats/trafic-compagnies',
  provenance: '/stats/trafic-provenance',
  destination: '/stats/trafic-destination',
  remplissage: '/stats/taux-remplissage',
  repartition: '/stats/repartition-compagnies',
  factures: '/stats/factures',
  demandes: '/stats/demandes',
  aeronefs: '/stats/aeronefs-aeroport',
}

const COLUMNS = {
  compagnies: [
    { key: 'compagnie', label: 'Compagnie' },
    { key: 'pax_depart', label: 'PAX départ', render: (r) => fmt(r.pax_depart) },
    { key: 'pax_arrivee', label: 'PAX arrivée', render: (r) => fmt(r.pax_arrivee) },
    { key: 'transit', label: 'Transit', render: (r) => fmt(r.transit) },
    { key: 'fret', label: 'Fret (kg)', render: (r) => fmt(r.fret) },
    { key: 'poste', label: 'Poste (kg)', render: (r) => fmt(r.poste) },
    { key: 'mouvements', label: 'Mouvements' },
  ],
  provenance: [
    { key: 'code', label: 'Code' },
    { key: 'nom', label: 'Aéroport de provenance' },
    { key: 'pays', label: 'Pays' },
    { key: 'pax', label: 'PAX arrivés', render: (r) => fmt(r.pax) },
    { key: 'fret', label: 'Fret (kg)', render: (r) => fmt(r.fret) },
    { key: 'escales', label: 'Escales' },
  ],
  destination: [
    { key: 'code', label: 'Code' },
    { key: 'nom', label: 'Aéroport de destination' },
    { key: 'pays', label: 'Pays' },
    { key: 'pax', label: 'PAX départ', render: (r) => fmt(r.pax) },
    { key: 'fret', label: 'Fret (kg)', render: (r) => fmt(r.fret) },
    { key: 'escales', label: 'Escales' },
  ],
  remplissage: [
    { key: 'compagnie', label: 'Compagnie' },
    { key: 'ligne', label: 'Ligne' },
    { key: 'pax', label: 'PAX effectifs', render: (r) => fmt(r.pax) },
    { key: 'capacite', label: 'Capacité offerte', render: (r) => fmt(r.capacite) },
    { key: 'vols', label: 'Vols' },
    { key: 'taux', label: 'Taux', render: (r) => `${r.taux} %` },
  ],
  repartition: [
    { key: 'compagnie', label: 'Compagnie' },
    { key: 'pax', label: 'PAX', render: (r) => fmt(r.pax) },
    { key: 'part_pax', label: 'Part PAX', render: (r) => `${r.part_pax} %` },
    { key: 'fret', label: 'Fret (kg)', render: (r) => fmt(r.fret) },
    { key: 'part_fret', label: 'Part fret', render: (r) => `${r.part_fret} %` },
    { key: 'mouvements', label: 'Mouvements' },
    { key: 'part_mouvements', label: 'Part mvt', render: (r) => `${r.part_mouvements} %` },
  ],
  factures: [
    { key: 'compagnie', label: 'Compagnie' },
    { key: 'pax_redevance', label: 'PAX redevables', render: (r) => fmt(r.pax_redevance) },
    { key: 'tarif_unitaire', label: 'Tarif / PAX', render: (r) => `${fmt(r.tarif_unitaire)} FCFA` },
    { key: 'montant', label: 'Montant', render: (r) => `${fmt(r.montant)} FCFA` },
    { key: 'vols', label: 'Vols' },
  ],
  aeronefs: [
    { key: 'immatriculation', label: 'Immatriculation' },
    { key: 'modele', label: 'Modèle' },
    { key: 'compagnie', label: 'Compagnie' },
    { key: 'capacite', label: 'Capacité' },
  ],
}

const Icon = ({ path, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
)

const ICONS = {
  avion: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
  passagers: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  fret: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  poste: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  demandes: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  argent: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
}

const tooltipStyle = {
  borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,.08)',
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [compagnies, setCompagnies] = useState([])
  const [aeroports, setAeroports] = useState([])
  const [filters, setFilters] = useState({ date_debut: '', date_fin: '', compagnie_id: '', aeroport_id: '' })
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('compagnies')
  const [report, setReport] = useState(null)
  const [reportExtra, setReportExtra] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    api.get('/compagnies').then((r) => setCompagnies(r.data))
    api.get('/aeroports').then((r) => setAeroports(r.data))
  }, [])

  const activeParams = () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))

  const load = () => {
    setLoading(true)
    api.get('/stats/dashboard', { params: activeParams() })
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }

  const loadReport = () => {
    setReportLoading(true)
    api.get(ENDPOINTS[tab], { params: activeParams() })
      .then((r) => {
        if (tab === 'factures') { setReport(r.data.factures); setReportExtra(r.data.aeroport_reference) }
        else { setReport(r.data); setReportExtra(null) }
      })
      .finally(() => setReportLoading(false))
  }

  // Filtres automatiques : chaque changement recharge les KPI et l'état actif
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; load(); return }
    const t = setTimeout(() => { load(); loadReport() }, 350)
    return () => clearTimeout(t)
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setReport(null); loadReport() }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return <div className="text-slate-500">Chargement…</div>

  const k = data.kpi
  const statutsChart = Object.entries(STATUTS)
    .map(([key, s]) => ({ name: s.label, value: data.demandes_par_statut[key] ?? 0, fill: s.hex }))
    .filter((s) => s.value > 0)

  const cards = [
    { label: 'Mouvements', value: fmt(k.mouvements), sub: `${fmt(k.vols)} vols sur la période`, icon: ICONS.avion, chip: 'bg-blue-100 text-blue-800' },
    { label: 'Passagers', value: fmt(k.passagers), sub: `${fmt(k.pax_depart)} dép · ${fmt(k.pax_arrivee)} arr · ${fmt(k.transit)} transit`, icon: ICONS.passagers, chip: 'bg-indigo-100 text-indigo-700' },
    { label: 'Fret', value: `${fmt(k.fret)} kg`, icon: ICONS.fret, chip: 'bg-amber-100 text-amber-700' },
    { label: 'Poste', value: `${fmt(k.poste)} kg`, icon: ICONS.poste, chip: 'bg-violet-100 text-violet-700' },
    { label: 'Demandes ASA', value: fmt(k.demandes), sub: `${k.demandes_en_attente} en attente`, icon: ICONS.demandes, chip: 'bg-sky-100 text-sky-700', to: '/demandes', alert: k.demandes_en_attente > 0 },
    { label: 'Montant facturé', value: `${fmt(k.facture)} FCFA`, icon: ICONS.argent, chip: 'bg-emerald-100 text-emerald-700' },
  ]

  const renderReport = () => {
    if (reportLoading) return <p className="text-slate-400 text-sm py-8 text-center">Chargement…</p>
    if (report === null) return null

    if (tab === 'demandes') {
      const LIBELLES = { en_attente: 'En attente', autorisee: 'Autorisée', refusee: 'Refusée', annulee: 'Annulée' }
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(LIBELLES).map(([k2, l]) => (
              <div key={k2} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="text-xl font-bold">{report.par_statut?.[k2] ?? 0}</div>
                <div className="text-xs text-slate-500 mt-1">{l}</div>
              </div>
            ))}
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="text-xl font-bold text-emerald-700">{fmt(report.facturation?.total_facture)} F</div>
              <div className="text-xs text-emerald-600 mt-1">{report.facturation?.autorisations ?? 0} autorisations facturées</div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-700 mb-2">Répartition par demandeur</h4>
              <Table
                columns={[
                  { key: 'demandeur', label: 'Demandeur', render: (r) => r.compagnie ?? r.demandeur_nom ?? r.demandeur_type },
                  { key: 'demandeur_type', label: 'Type' },
                  { key: 'total', label: 'Demandes' },
                ]}
                rows={report.par_demandeur ?? []}
              />
            </div>
            <div>
              <h4 className="font-semibold text-slate-700 mb-2">Par provenance / destination / type d'opérateur</h4>
              <Table
                columns={[
                  { key: 'provenance', label: 'Provenance' },
                  { key: 'destination', label: 'Destination' },
                  { key: 'demandeur_type', label: 'Opérateur' },
                  { key: 'total', label: 'Demandes' },
                ]}
                rows={report.par_destination ?? []}
              />
            </div>
          </div>
        </div>
      )
    }

    return (
      <>
        {tab === 'factures' && reportExtra && (
          <p className="text-sm text-slate-500 mb-3">
            Redevances calculées sur les PAX au départ de <b>{reportExtra.nom} ({reportExtra.code})</b> — tarif {fmt(1000)} FCFA/passager.
          </p>
        )}
        <Table columns={COLUMNS[tab]} rows={Array.isArray(report) ? report : []} />
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bannière institutionnelle */}
      <div className="rounded-xl bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 text-white p-6 shadow-lg relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-yellow-400" />
        <div className="flex items-center justify-between flex-wrap gap-4 pl-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-yellow-400">République du Tchad — Autorité de l'Aviation Civile</div>
            <h1 className="text-2xl font-bold mt-1">Tableau de bord du trafic aérien</h1>
            <p className="text-blue-200 text-sm mt-1">
              Statistiques en temps réel — période du <b>{data.periode.debut}</b> au <b>{data.periode.fin}</b>
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-6 text-center">
              <div>
                <div className="text-3xl font-extrabold text-yellow-400">{fmt(k.mouvements)}</div>
                <div className="text-[11px] uppercase tracking-wider text-blue-200">Mouvements</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-yellow-400">{fmt(k.passagers)}</div>
                <div className="text-[11px] uppercase tracking-wider text-blue-200">Passagers</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-yellow-400">{fmt(k.demandes)}</div>
                <div className="text-[11px] uppercase tracking-wider text-blue-200">Demandes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
          <Field label="Date début"><Input type="date" value={filters.date_debut} onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })} /></Field>
          <Field label="Date fin"><Input type="date" value={filters.date_fin} onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })} /></Field>
          <Field label="Compagnie">
            <Select value={filters.compagnie_id} onChange={(e) => setFilters({ ...filters, compagnie_id: e.target.value })}>
              <option value="">Toutes</option>
              {compagnies.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </Select>
          </Field>
          <Field label="Aéroport de référence">
            <Select value={filters.aeroport_id} onChange={(e) => setFilters({ ...filters, aeroport_id: e.target.value })}>
              <option value="">—</option>
              {aeroports.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.ville}</option>)}
            </Select>
          </Field>
          <div className="flex items-center gap-2">
            {loading && <span className="text-xs text-slate-400">Actualisation…</span>}
            <Btn variant="secondary" onClick={() => setFilters({ date_debut: '', date_fin: '', compagnie_id: '', aeroport_id: '' })}>Réinitialiser</Btn>
          </div>
        </div>
      </Card>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((c) => {
          const inner = (
            <div className={`bg-white rounded-xl border p-4 transition h-full shadow-sm hover:shadow-md ${c.alert ? 'border-amber-400 ring-1 ring-amber-200' : 'border-slate-200'}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.chip}`}>
                <Icon path={c.icon} />
              </div>
              <div className="text-2xl font-extrabold text-slate-800 leading-none">{c.value}</div>
              <div className="text-xs font-medium text-slate-500 mt-1.5">{c.label}</div>
              {c.sub && <div className="text-[11px] text-slate-400 mt-0.5">{c.sub}</div>}
            </div>
          )
          return c.to ? <Link key={c.label} to={c.to}>{inner}</Link> : <div key={c.label}>{inner}</div>
        })}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title="Évolution mensuelle du trafic passagers" className="xl:col-span-2">
          {data.mensuel.length === 0 ? (
            <p className="text-slate-400 text-sm py-10 text-center">Aucune donnée sur la période</p>
          ) : (
            <div id="chart-mensuel">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.mensuel} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="gDep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e40af" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gArr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4a700" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#d4a700" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [fmt(v), name === 'pax_dep' ? 'PAX départ' : 'PAX arrivée']} />
                <Legend formatter={(v) => (v === 'pax_dep' ? 'PAX départ' : 'PAX arrivée')} wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="pax_dep" stroke="#1e40af" strokeWidth={2.5} fill="url(#gDep)">
                  <LabelList dataKey="pax_dep" position="top" formatter={(v) => fmt(v)} style={{ fontSize: 10, fill: '#1e40af', fontWeight: 600 }} />
                </Area>
                <Area type="monotone" dataKey="pax_arr" stroke="#d4a700" strokeWidth={2.5} fill="url(#gArr)">
                  <LabelList dataKey="pax_arr" position="bottom" formatter={(v) => fmt(v)} style={{ fontSize: 10, fill: '#b88900', fontWeight: 600 }} />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Demandes ASA par statut">
          {statutsChart.length === 0 ? (
            <p className="text-slate-400 text-sm py-10 text-center">Aucune demande sur la période</p>
          ) : (
            <div id="chart-statuts">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statutsChart} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {statutsChart.map((s) => <Cell key={s.name} fill={s.fill} />)}
                  <LabelList dataKey="value" position="inside" fill="#fff" fontSize={12} fontWeight={700} />
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title="Top compagnies — passagers transportés" className="xl:col-span-1">
          {data.top_compagnies.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">Aucune donnée</p>
          ) : (
            <div id="chart-top">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.top_compagnies} layout="vertical" margin={{ top: 0, right: 45, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="compagnie" width={110} tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmt(v), 'PAX']} />
                <Bar dataKey="pax" fill="#1e40af" radius={[0, 4, 4, 0]} barSize={18}>
                  <LabelList dataKey="pax" position="right" formatter={(v) => fmt(v)} style={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Dernières demandes d'autorisation" className="xl:col-span-2">
          <Table
            columns={[
              { key: 'numero', label: 'N°', render: (r) => <span className="font-semibold text-blue-800">{r.numero}</span> },
              { key: 'demandeur_libelle', label: 'Demandeur' },
              { key: 'type', label: 'Type', render: (r) => r.type.replaceAll('_', ' / ') },
              { key: 'date_vol', label: 'Date vol', render: (r) => r.date_vol?.slice(0, 10) },
              { key: 'statut', label: 'Statut', render: (r) => <Badge color={STATUTS[r.statut].color}>{STATUTS[r.statut].label}</Badge> },
            ]}
            rows={data.dernieres_demandes}
          />
        </Card>
      </div>

      {/* États détaillés */}
      <Card title="États détaillés">
        <div className="flex flex-wrap gap-2 mb-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                tab === t.key ? 'bg-blue-800 text-white shadow-sm' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {renderReport()}
      </Card>
    </div>
  )
}
