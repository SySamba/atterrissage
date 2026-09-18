<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1e293b; }
        .header { margin-bottom: 16px; border-bottom: 2px solid #1e3a73; padding-bottom: 8px; }
        .org { font-size: 12px; font-weight: bold; color: #1e3a73; }
        .service { font-size: 9px; color: #64748b; }
        h1 { font-size: 15px; margin: 10px 0 4px; }
        .meta { font-size: 9px; color: #64748b; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1e3a73; color: #fff; padding: 5px 6px; text-align: left; font-size: 9px; }
        td { padding: 4px 6px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) td { background: #f8fafc; }
        .footer { margin-top: 14px; font-size: 8px; color: #94a3b8; text-align: right; }
    </style>
</head>
<body>
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

    <h1>{{ $titre }}</h1>
    <div class="meta">
        Période : {{ $periode }}
        @if($parametre->aeroportReference)
            — Aéroport de référence : {{ $parametre->aeroportReference->nom }} ({{ $parametre->aeroportReference->code }})
        @endif
    </div>

    @if(empty($rows))
        <p>Aucune donnée pour cette période.</p>
    @else
        <table>
            <thead>
                <tr>
                    @foreach(array_keys((array) $rows[0]) as $col)
                        <th>{{ str_replace('_', ' ', $col) }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @foreach($rows as $row)
                    <tr>
                        @foreach((array) $row as $v)
                            <td>{{ is_scalar($v) || is_null($v) ? $v : json_encode($v, JSON_UNESCAPED_UNICODE) }}</td>
                        @endforeach
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="footer">Généré le {{ $genereLe }} — {{ $parametre->exploitant ?? '' }}</div>
</body>
</html>
