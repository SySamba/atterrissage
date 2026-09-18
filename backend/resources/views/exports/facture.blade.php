<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1e293b; }
        .header { border-bottom: 2px solid #1e3a73; padding-bottom: 8px; margin-bottom: 20px; }
        .org { font-size: 13px; font-weight: bold; color: #1e3a73; }
        .service { font-size: 9px; color: #64748b; }
        h1 { font-size: 17px; margin: 4px 0; }
        .ref { color: #64748b; font-size: 10px; }
        table.lignes { width: 100%; border-collapse: collapse; margin-top: 16px; }
        table.lignes th { background: #1e3a73; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; }
        table.lignes td { padding: 7px 8px; border-bottom: 1px solid #e2e8f0; }
        table.lignes td.r { text-align: right; }
        .total td { font-weight: bold; background: #eef2fb; border-top: 2px solid #1e3a73; }
        .payable { margin-top: 24px; border: 2px solid #1e3a73; padding: 10px; font-size: 13px; font-weight: bold; text-align: center; }
        .footer { margin-top: 28px; font-size: 8px; color: #94a3b8; text-align: right; }
        .cols { width: 100%; margin-top: 10px; }
        .cols td { vertical-align: top; font-size: 10px; }
    </style>
</head>
<body>
    @php $types = ['survol' => 'Redevance de survol', 'atterrissage' => "Redevance d'atterrissage", 'survol_atterrissage' => 'Redevance de survol + atterrissage']; @endphp

    <div class="header">
        <table style="width:100%; border-collapse:collapse;">
            <tr>
                <td style="width:70px; vertical-align:middle;"><img src="{{ public_path('logo.png') }}" style="width:60px;" /></td>
                <td style="vertical-align:middle;">
                    <div style="font-size:10px; font-weight:bold; color:#b59b00; text-transform:uppercase; letter-spacing:1px;">République du Tchad</div>
                    <div class="org">Autorité de l'Aviation Civile (ADAC)</div>
                    <div class="service">{{ $parametre->service ?? '' }} — {{ $parametre->telephone ?? '' }} — {{ $parametre->email ?? '' }}</div>
                </td>
            </tr>
        </table>
    </div>

    <h1>FACTURE</h1>
    <div class="ref">
        Autorisation N° {{ $demande->numero_autorisation }} — Demande {{ $demande->numero }}<br>
        Date d'émission : {{ $genereLe }}
    </div>

    <table class="cols">
        <tr>
            <td>
                <b>Facturé à :</b><br>
                {{ $demande->demandeur_libelle }}<br>
                {{ $demande->representant?->organisme ?? $demande->compagnie?->nom }}
            </td>
            <td>
                <b>Vol :</b> {{ $demande->immatriculation }} {{ $demande->type_aeronef ? '('.$demande->type_aeronef.')' : '' }}<br>
                <b>Trajet :</b> {{ $demande->aeroportProvenance?->code }} → {{ $demande->aeroportDestination?->code }}<br>
                <b>Date :</b> {{ $demande->date_vol?->format('d/m/Y') }}
            </td>
        </tr>
    </table>

    <table class="lignes">
        <thead>
            <tr><th>Libellé</th><th>Quantité</th><th>P.U. (FCFA)</th><th style="text-align:right">Montant (FCFA)</th></tr>
        </thead>
        <tbody>
            @php
                $tarif = match($demande->type) {
                    'survol' => $parametre->tarif_survol,
                    'atterrissage' => $parametre->tarif_atterrissage,
                    default => $parametre->tarif_survol_atterrissage,
                };
                $fret = max(0, (float) $demande->montant_facture - (float) $tarif);
            @endphp
            <tr>
                <td>{{ $types[$demande->type] ?? $demande->type }}</td>
                <td>1</td>
                <td>{{ number_format($tarif, 0, ',', ' ') }}</td>
                <td class="r">{{ number_format($tarif, 0, ',', ' ') }}</td>
            </tr>
            @if($fret > 0)
            <tr>
                <td>Redevance fret</td>
                <td>{{ number_format($demande->poids_fret, 0, ',', ' ') }} kg</td>
                <td>50</td>
                <td class="r">{{ number_format($fret, 0, ',', ' ') }}</td>
            </tr>
            @endif
            <tr class="total">
                <td colspan="3">TOTAL À PAYER</td>
                <td class="r">{{ number_format($demande->montant_facture, 0, ',', ' ') }} FCFA</td>
            </tr>
        </tbody>
    </table>

    <div class="payable">NET À PAYER : {{ number_format($demande->montant_facture, 0, ',', ' ') }} FCFA</div>

    <div class="footer">
        {{ $parametre->exploitant ?? '' }} — Facture générée le {{ $genereLe }}<br>
        Traité par : {{ $demande->traitePar?->name }}
    </div>
</body>
</html>
