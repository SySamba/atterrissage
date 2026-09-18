<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1e293b; }
        .header { border-bottom: 2px solid #1e3a73; padding-bottom: 8px; margin-bottom: 16px; }
        .org { font-size: 13px; font-weight: bold; color: #1e3a73; }
        .service { font-size: 9px; color: #64748b; }
        h1 { font-size: 16px; margin: 6px 0; }
        .num { font-size: 12px; color: #1e3a73; font-weight: bold; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 10px; font-size: 10px; font-weight: bold; }
        .en_attente { background: #fef3c7; color: #92400e; }
        .autorisee { background: #d1fae5; color: #065f46; }
        .refusee { background: #fee2e2; color: #991b1b; }
        .annulee { background: #e2e8f0; color: #475569; }
        h2 { font-size: 12px; color: #1e3a73; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin: 16px 0 6px; }
        table.info { width: 100%; border-collapse: collapse; }
        table.info td { padding: 5px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        table.info td.k { width: 32%; font-weight: bold; color: #475569; }
        .footer { margin-top: 24px; font-size: 8px; color: #94a3b8; text-align: right; }
        .box { border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 10px; background: #f8fafc; margin-top: 8px; }
    </style>
</head>
<body>
    @php
        $statuts = ['en_attente' => 'EN ATTENTE', 'autorisee' => 'AUTORISÉE', 'refusee' => 'REFUSÉE', 'annulee' => 'ANNULÉE'];
        $types = ['survol' => 'Survol', 'atterrissage' => 'Atterrissage', 'survol_atterrissage' => 'Survol + Atterrissage'];
        $demandeurs = ['compagnie' => 'Compagnie aérienne', 'operateur' => 'Opérateur de transport aérien', 'representant_diplomatique' => 'Représentant diplomatique'];
    @endphp

    <div class="header">
        <table style="width:100%; border-collapse:collapse;">
            <tr>
                <td style="width:70px; vertical-align:middle;"><img src="{{ public_path('logo.png') }}" style="width:60px;" /></td>
                <td style="vertical-align:middle;">
                    <div style="font-size:10px; font-weight:bold; color:#b59b00; text-transform:uppercase; letter-spacing:1px;">République du Tchad</div>
                    <div class="org">Autorité de l'Aviation Civile (ADAC)</div>
                    <div class="service">{{ $parametre->service ?? '' }} — {{ $parametre->telephone ?? '' }}</div>
                </td>
            </tr>
        </table>
    </div>

    <h1>Demande d'autorisation de survol / atterrissage</h1>
    <div class="num">N° {{ $demande->numero }} <span class="badge {{ $demande->statut }}">{{ $statuts[$demande->statut] }}</span></div>

    <h2>Demandeur</h2>
    <table class="info">
        <tr><td class="k">Type de demandeur</td><td>{{ $demandeurs[$demande->demandeur_type] ?? $demande->demandeur_type }}</td></tr>
        <tr><td class="k">Demandeur</td><td>{{ $demande->demandeur_libelle }}</td></tr>
        @if($demande->representant?->organisme)<tr><td class="k">Organisme</td><td>{{ $demande->representant->organisme }}</td></tr>@endif
        <tr><td class="k">Objet</td><td>{{ $demande->objet ?? '—' }}</td></tr>
        <tr><td class="k">Déposée le</td><td>{{ $demande->created_at?->format('d/m/Y à H:i') }}</td></tr>
    </table>

    <h2>Vol concerné</h2>
    <table class="info">
        <tr><td class="k">Type d'autorisation</td><td>{{ $types[$demande->type] ?? $demande->type }}</td></tr>
        <tr><td class="k">Nature du vol</td><td>{{ $demande->natureVol?->libelle ?? '—' }}</td></tr>
        <tr><td class="k">Numéro de vol</td><td>{{ $demande->numero_vol ?? '—' }}</td></tr>
        <tr><td class="k">Immatriculation</td><td>{{ $demande->immatriculation ?? '—' }}</td></tr>
        <tr><td class="k">Type d'aéronef</td><td>{{ $demande->type_aeronef ?? '—' }}</td></tr>
        <tr><td class="k">Provenance</td><td>{{ $demande->aeroportProvenance?->nom }} ({{ $demande->aeroportProvenance?->code }})</td></tr>
        <tr><td class="k">Destination</td><td>{{ $demande->aeroportDestination?->nom }} ({{ $demande->aeroportDestination?->code }})</td></tr>
        <tr><td class="k">Date du vol</td><td>{{ $demande->date_vol?->format('d/m/Y') }}</td></tr>
        <tr><td class="k">Poids du fret</td><td>{{ number_format($demande->poids_fret, 0, ',', ' ') }} kg</td></tr>
    </table>

    @if($demande->details)
        <h2>Détails — {{ $demande->natureVol?->libelle ?? 'vol' }}</h2>
        <table class="info">
            @foreach(\App\Models\Demande::DETAIL_LABELS as $cle => $libelle)
                @if(!empty($demande->details[$cle]))
                    <tr><td class="k">{{ $libelle }}</td><td>{{ $demande->details[$cle] }}</td></tr>
                @endif
            @endforeach
        </table>
    @endif

    @if($demande->documents->isNotEmpty())
        <h2>Pièces jointes</h2>
        <table class="info">
            @foreach($demande->documents as $doc)
                <tr>
                    <td class="k">{{ \App\Models\Demande::DOC_LABELS[$doc->champ] ?? $doc->champ }}</td>
                    <td>{{ $doc->nom_original }}</td>
                </tr>
            @endforeach
        </table>
    @endif

    <h2>Traitement</h2>
    @if($demande->statut === 'autorisee')
        <div class="box">
            <b>N° d'autorisation :</b> {{ $demande->numero_autorisation }}<br>
            <b>Montant facturé :</b> {{ number_format($demande->montant_facture, 0, ',', ' ') }} FCFA<br>
            <b>Traité par :</b> {{ $demande->traitePar?->name }} le {{ $demande->date_traitement?->format('d/m/Y à H:i') }}
        </div>
    @elseif($demande->statut === 'refusee')
        <div class="box"><b>Motif du refus :</b> {{ $demande->motif_refus ?? '—' }}</div>
    @elseif($demande->statut === 'annulee')
        <div class="box">Demande annulée{{ $demande->motif_refus ? ' — '.$demande->motif_refus : '' }}</div>
    @else
        <div class="box">Demande en attente de traitement par le bureau survol.</div>
    @endif

    @if($demande->observations)
        <h2>Observations</h2>
        <p>{{ $demande->observations }}</p>
    @endif

    <div class="footer">Document généré le {{ $genereLe }} — {{ $parametre->exploitant ?? '' }}</div>
</body>
</html>
