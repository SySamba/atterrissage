<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Parametre;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    private const TYPES = [
        'trafic-compagnies' => ['traficParCompagnie', 'Trafic par compagnie'],
        'trafic-provenance' => ['traficParProvenance', 'Trafic par provenance'],
        'trafic-destination' => ['traficParDestination', 'Trafic par destination'],
        'taux-remplissage' => ['tauxRemplissage', 'Taux de remplissage des vols'],
        'repartition-compagnies' => ['repartitionCompagnies', 'Répartition du trafic par compagnie'],
        'factures' => ['factures', 'Factures redevances aviation civile'],
        'aeronefs-aeroport' => ['aeronefsParAeroport', 'Aéronefs desservant l\'aéroport'],
    ];

    /**
     * Export PDF du tableau de bord complet (KPI, trafic mensuel,
     * demandes par statut, top compagnies, dernières demandes).
     */
    public function dashboard(Request $request)
    {
        $stats = app(StatistiqueController::class);
        $data = $stats->dashboard($request)->getData(true);

        // Images des graphiques envoyées par le frontend (data URI PNG)
        $images = collect($request->input('images', []))
            ->filter(fn ($i) => is_string($i) && str_starts_with($i, 'data:image/'))
            ->all();

        $pdf = Pdf::loadView('exports.dashboard', [
            'data' => $data,
            'images' => $images,
            'parametre' => Parametre::instance()->load('aeroportReference'),
            'genereLe' => now()->format('d/m/Y H:i'),
        ])->setPaper('a4', 'portrait');

        return $pdf->download('tableau_de_bord_'.now()->format('Ymd_His').'.pdf');
    }

    public function export(Request $request, string $type)
    {
        abort_unless(isset(self::TYPES[$type]), 404);

        [$method, $titre] = self::TYPES[$type];

        $stats = app(StatistiqueController::class);
        $payload = $stats->$method($request)->getData(true);

        // « factures » renvoie {aeroport_reference, factures} : on exporte la liste
        if (isset($payload['factures']) && is_array($payload['factures'])) {
            $payload = $payload['factures'];
        }

        $rows = is_array($payload) ? array_values($payload) : [];
        $format = $request->query('format', 'csv');

        return $format === 'pdf'
            ? $this->pdf($titre, $rows, $request)
            : $this->csv($titre, $rows);
    }

    private function csv(string $titre, array $rows): StreamedResponse
    {
        $filename = str_replace(' ', '_', mb_strtolower($titre)).'_'.now()->format('Ymd_His').'.csv';

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            // BOM UTF-8 pour ouverture correcte des accents dans Excel
            fwrite($out, "\xEF\xBB\xBF");

            if (empty($rows)) {
                fputcsv($out, ['Aucune donnée'], ';');
                fclose($out);
                return;
            }

            fputcsv($out, array_keys((array) $rows[0]), ';');

            foreach ($rows as $row) {
                fputcsv($out, array_map(
                    fn ($v) => is_scalar($v) || $v === null ? $v : json_encode($v, JSON_UNESCAPED_UNICODE),
                    array_values((array) $row)
                ), ';');
            }

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function pdf(string $titre, array $rows, Request $request)
    {
        $parametre = Parametre::instance()->load('aeroportReference');

        $pdf = Pdf::loadView('exports.table', [
            'titre' => $titre,
            'rows' => $rows,
            'parametre' => $parametre,
            'periode' => trim(($request->date_debut ?? '…').' → '.($request->date_fin ?? '…')),
            'genereLe' => now()->format('d/m/Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download(str_replace(' ', '_', mb_strtolower($titre)).'.pdf');
    }
}
