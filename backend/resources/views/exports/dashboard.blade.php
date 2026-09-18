<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1e293b; }
        .header { margin-bottom: 14px; border-bottom: 2px solid #1e3a73; padding-bottom: 8px; }
        .org { font-size: 12px; font-weight: bold; color: #1e3a73; }
        .service { font-size: 9px; color: #64748b; }
        h1 { font-size: 15px; margin: 8px 0 2px; }
        .meta { font-size: 9px; color: #64748b; margin-bottom: 10px; }
        h2 { font-size: 11px; color: #1e3a73; margin: 14px 0 5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1e3a73; color: #fff; padding: 5px 6px; text-align: left; font-size: 9px; }
        td { padding: 4px 6px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) td { background: #f8fafc; }
        .kpi-table td { border: 1px solid #e2e8f0; text-align: center; padding: 8px 4px; }
        .kpi-val { font-size: 14px; font-weight: bold; color: #1e3a73; display: block; }
        .kpi-lbl { font-size: 8px; color: #64748b; text-transform: uppercase; }
        .right { text-align: right; }
        .footer { margin-top: 14px; font-size: 8px; color: #94a3b8; text-align: right; }
        .empty { color: #94a3b8; font-style: italic; }
    </style>
</head>
<body>
    @php
        $fmt = fn ($n) => number_format((float) ($n ?? 0), 0, ',', ' ');
        $k = $data['kpi'] ?? [];
        $statuts = ['en_attente' => 'En attente', 'autorisee' => 'Autorisée', 'refusee' => 'Refusée', 'annulee' => 'Annulée'];
    @endphp

    <div class="header">
        <table style="width:100%; border-collapse:collapse;">
            <tr>
                <td style="width:70px; vertical-align:middle;"><img src="{{ public_path('logo.png') }}" style="width:60px;" /></td>
                <td style="vertical-align:middle;">
                    <div style="font-size:10px; font-weight:bold; color:#b59b00; text-transform:uppercase; letter-spacing:1px;">République du Tchad</div>
                    <div class="org">Autorité de l'Aviation Civile (ADAC)</div>
                    <div class="service">{{ $parametre->service ?? '' }}</div>
                </td>
            </tr>
        </table>
    </div>

    <h1>Tableau de bord du trafic aérien</h1>
    <div class="meta">
        Période : {{ $data['periode']['debut'] ?? '…' }} → {{ $data['periode']['fin'] ?? '…' }}
        @if($parametre->aeroportReference)
            — Aéroport de référence : {{ $parametre->aeroportReference->nom }} ({{ $parametre->aeroportReference->code }})
        @endif
    </div>

    <h2>Indicateurs clés</h2>
    <table class="kpi-table">
        <tr>
            <td><span class="kpi-val">{{ $fmt($k['mouvements'] ?? 0) }}</span><span class="kpi-lbl">Mouvements</span></td>
            <td><span class="kpi-val">{{ $fmt($k['vols'] ?? 0) }}</span><span class="kpi-lbl">Vols</span></td>
            <td><span class="kpi-val">{{ $fmt($k['passagers'] ?? 0) }}</span><span class="kpi-lbl">Passagers</span></td>
            <td><span class="kpi-val">{{ $fmt($k['fret'] ?? 0) }}</span><span class="kpi-lbl">Fret (kg)</span></td>
            <td><span class="kpi-val">{{ $fmt($k['poste'] ?? 0) }}</span><span class="kpi-lbl">Poste (kg)</span></td>
        </tr>
        <tr>
            <td><span class="kpi-val">{{ $fmt($k['pax_depart'] ?? 0) }}</span><span class="kpi-lbl">PAX départ</span></td>
            <td><span class="kpi-val">{{ $fmt($k['pax_arrivee'] ?? 0) }}</span><span class="kpi-lbl">PAX arrivée</span></td>
            <td><span class="kpi-val">{{ $fmt($k['transit'] ?? 0) }}</span><span class="kpi-lbl">Transit</span></td>
            <td><span class="kpi-val">{{ $fmt($k['demandes'] ?? 0) }}</span><span class="kpi-lbl">Demandes ASA</span></td>
            <td><span class="kpi-val">{{ $fmt($k['facture'] ?? 0) }}</span><span class="kpi-lbl">Facturé (FCFA)</span></td>
        </tr>
    </table>

    <h2>Évolution mensuelle du trafic</h2>
    @if(!empty($images['mensuel']))
        <img src="{{ $images['mensuel'] }}" style="width:100%;" />
    @elseif(empty($data['mensuel']))
        <p class="empty">Aucune donnée sur la période.</p>
    @else
        <table>
            <thead>
                <tr><th>Mois</th><th class="right">PAX départ</th><th class="right">PAX arrivée</th><th class="right">Fret (kg)</th><th class="right">Mouvements</th></tr>
            </thead>
            <tbody>
                @foreach($data['mensuel'] as $m)
                    <tr>
                        <td>{{ $m['mois'] }}</td>
                        <td class="right">{{ $fmt($m['pax_dep'] ?? 0) }}</td>
                        <td class="right">{{ $fmt($m['pax_arr'] ?? 0) }}</td>
                        <td class="right">{{ $fmt($m['fret'] ?? 0) }}</td>
                        <td class="right">{{ $fmt($m['mouvements'] ?? 0) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    @if(!empty($images['statuts']) || !empty($images['top']))
        <h2>Demandes ASA par statut et top compagnies</h2>
        <table style="border-collapse:collapse;">
            <tr>
                <td style="width:50%; border:none; padding:0 8px 0 0; vertical-align:top;">
                    @if(!empty($images['statuts']))
                        <img src="{{ $images['statuts'] }}" style="width:100%;" />
                    @endif
                </td>
                <td style="width:50%; border:none; padding:0; vertical-align:top;">
                    @if(!empty($images['top']))
                        <img src="{{ $images['top'] }}" style="width:100%;" />
                    @endif
                </td>
            </tr>
        </table>
    @else
        <h2>Demandes ASA par statut</h2>
        <table>
            <thead><tr><th>Statut</th><th class="right">Nombre</th></tr></thead>
            <tbody>
                @foreach($statuts as $key => $label)
                    <tr><td>{{ $label }}</td><td class="right">{{ $fmt($data['demandes_par_statut'][$key] ?? 0) }}</td></tr>
                @endforeach
            </tbody>
        </table>

        <h2>Top compagnies — passagers transportés</h2>
        @if(empty($data['top_compagnies']))
            <p class="empty">Aucune donnée.</p>
        @else
            <table>
                <thead><tr><th>Compagnie</th><th class="right">PAX</th></tr></thead>
                <tbody>
                    @foreach($data['top_compagnies'] as $c)
                        <tr><td>{{ $c['compagnie'] }}</td><td class="right">{{ $fmt($c['pax'] ?? 0) }}</td></tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    @endif

    <h2>Dernières demandes d'autorisation</h2>
    @if(empty($data['dernieres_demandes']))
        <p class="empty">Aucune demande.</p>
    @else
        <table>
            <thead><tr><th>N°</th><th>Demandeur</th><th>Type</th><th>Date vol</th><th>Statut</th></tr></thead>
            <tbody>
                @foreach($data['dernieres_demandes'] as $d)
                    <tr>
                        <td>{{ $d['numero'] }}</td>
                        <td>{{ $d['demandeur_libelle'] ?? '—' }}</td>
                        <td>{{ str_replace('_', ' / ', $d['type'] ?? '') }}</td>
                        <td>{{ isset($d['date_vol']) ? substr($d['date_vol'], 0, 10) : '—' }}</td>
                        <td>{{ $statuts[$d['statut']] ?? $d['statut'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="footer">Généré le {{ $genereLe }} — {{ $parametre->exploitant ?? 'ADAC' }}</div>
</body>
</html>
