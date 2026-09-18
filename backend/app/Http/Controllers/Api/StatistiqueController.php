<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aeroport;
use App\Models\Demande;
use App\Models\Escale;
use App\Models\Parametre;
use App\Models\Vol;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatistiqueController extends Controller
{
    public const TARIF_REDEVANCE_PAX = 1000; // FCFA par passager au départ de l'aéroport de référence

    public function dashboard(Request $request)
    {
        // Filtres de période : par défaut les 12 derniers mois
        $debut = $request->filled('date_debut') ? $request->date_debut : now()->subMonths(12)->startOfMonth()->toDateString();
        $fin = $request->filled('date_fin') ? $request->date_fin : now()->toDateString();
        $compagnieId = $request->compagnie_id;

        $volsPeriode = Vol::query()
            ->whereDate('date_vol', '>=', $debut)
            ->whereDate('date_vol', '<=', $fin)
            ->when($compagnieId, fn ($q) => $q->where('compagnie_id', $compagnieId));

        $escalesPeriode = Escale::query()
            ->join('vols', 'escales.vol_id', '=', 'vols.id')
            ->whereDate('vols.date_vol', '>=', $debut)
            ->whereDate('vols.date_vol', '<=', $fin)
            ->when($compagnieId, fn ($q) => $q->where('vols.compagnie_id', $compagnieId));

        $demandesPeriode = Demande::query()
            ->whereDate('created_at', '>=', $debut)
            ->whereDate('created_at', '<=', $fin)
            ->when($compagnieId, fn ($q) => $q->where('compagnie_id', $compagnieId));

        $mensuel = (clone $escalesPeriode)
            ->selectRaw("DATE_FORMAT(vols.date_vol, '%Y-%m') as mois")
            ->selectRaw('SUM(escales.pax_embarques) as pax_dep')
            ->selectRaw('SUM(escales.pax_debarques) as pax_arr')
            ->selectRaw('SUM(escales.fret) as fret')
            ->selectRaw('COUNT(DISTINCT vols.id) as mouvements')
            ->groupBy('mois')
            ->orderBy('mois')
            ->get();

        $trafic = (clone $escalesPeriode)
            ->selectRaw('SUM(escales.pax_embarques) as pax_dep')
            ->selectRaw('SUM(escales.pax_debarques) as pax_arr')
            ->selectRaw('SUM(escales.pax_transit) as transit')
            ->selectRaw('SUM(escales.fret) as fret')
            ->selectRaw('SUM(escales.poste) as poste')
            ->first();

        $facture = (clone $demandesPeriode)->where('statut', 'autorisee')->sum('montant_facture');

        return response()->json([
            'periode' => ['debut' => $debut, 'fin' => $fin],
            'kpi' => [
                'vols' => (clone $volsPeriode)->count(),
                'mouvements' => (clone $volsPeriode)->count(),
                'passagers' => (int) ($trafic->pax_dep ?? 0) + (int) ($trafic->pax_arr ?? 0),
                'pax_depart' => (int) ($trafic->pax_dep ?? 0),
                'pax_arrivee' => (int) ($trafic->pax_arr ?? 0),
                'transit' => (int) ($trafic->transit ?? 0),
                'fret' => (float) ($trafic->fret ?? 0),
                'poste' => (float) ($trafic->poste ?? 0),
                'demandes' => (clone $demandesPeriode)->count(),
                'demandes_en_attente' => (clone $demandesPeriode)->where('statut', 'en_attente')->count(),
                'facture' => (float) $facture,
            ],
            'totaux' => [
                'compagnies' => DB::table('compagnies')->count(),
                'aeronefs' => DB::table('aeronefs')->count(),
                'aeroports' => Aeroport::count(),
            ],
            'mensuel' => $mensuel,
            'demandes_par_statut' => (clone $demandesPeriode)->select('statut', DB::raw('COUNT(*) as total'))->groupBy('statut')->pluck('total', 'statut'),
            'top_compagnies' => (clone $escalesPeriode)
                ->join('compagnies', 'vols.compagnie_id', '=', 'compagnies.id')
                ->selectRaw('compagnies.nom as compagnie')
                ->selectRaw('SUM(escales.pax_embarques + escales.pax_debarques) as pax')
                ->groupBy('compagnies.id', 'compagnies.nom')
                ->orderByDesc('pax')
                ->limit(5)
                ->get(),
            'dernieres_demandes' => (clone $demandesPeriode)->with(['compagnie', 'representant'])->latest()->limit(5)->get()->map->append('demandeur_libelle'),
        ]);
    }

    public function traficParCompagnie(Request $request)
    {
        $query = $this->escalesPeriode($request);

        $rows = $query
            ->selectRaw('compagnies.nom as compagnie')
            ->selectRaw('SUM(escales.pax_embarques) as pax_depart')
            ->selectRaw('SUM(escales.pax_debarques) as pax_arrivee')
            ->selectRaw('SUM(escales.pax_transit) as transit')
            ->selectRaw('SUM(escales.fret) as fret')
            ->selectRaw('SUM(escales.poste) as poste')
            ->selectRaw('COUNT(DISTINCT vols.id) as mouvements')
            ->groupBy('compagnies.id', 'compagnies.nom')
            ->orderByDesc('pax_depart')
            ->get();

        return response()->json($rows);
    }

    public function traficParSens(Request $request)
    {
        $rows = $this->escalesPeriode($request)
            ->selectRaw('SUM(escales.pax_embarques) as pax_depart')
            ->selectRaw('SUM(escales.pax_debarques) as pax_arrivee')
            ->selectRaw('SUM(escales.pax_transit) as transit')
            ->selectRaw('SUM(escales.bebes) as bebes')
            ->selectRaw('SUM(escales.fret) as fret')
            ->selectRaw('SUM(escales.poste) as poste')
            ->selectRaw('COUNT(DISTINCT vols.id) as mouvements')
            ->first();

        return response()->json($rows);
    }

    public function traficParProvenance(Request $request)
    {
        $reference = $this->aeroportReference($request);

        $rows = $this->escalesPeriode($request)
            ->when($reference, fn ($q) => $q->where('escales.aeroport_arrivee_id', $reference))
            ->join('aeroports as prov', 'escales.aeroport_depart_id', '=', 'prov.id')
            ->selectRaw('prov.code, prov.nom, prov.ville, prov.pays')
            ->selectRaw('SUM(escales.pax_debarques) as pax')
            ->selectRaw('SUM(escales.fret) as fret')
            ->selectRaw('COUNT(*) as escales')
            ->groupBy('prov.id', 'prov.code', 'prov.nom', 'prov.ville', 'prov.pays')
            ->orderByDesc('pax')
            ->get();

        return response()->json($rows);
    }

    public function traficParDestination(Request $request)
    {
        $reference = $this->aeroportReference($request);

        $rows = $this->escalesPeriode($request)
            ->when($reference, fn ($q) => $q->where('escales.aeroport_depart_id', $reference))
            ->join('aeroports as dest', 'escales.aeroport_arrivee_id', '=', 'dest.id')
            ->selectRaw('dest.code, dest.nom, dest.ville, dest.pays')
            ->selectRaw('SUM(escales.pax_embarques) as pax')
            ->selectRaw('SUM(escales.fret) as fret')
            ->selectRaw('COUNT(*) as escales')
            ->groupBy('dest.id', 'dest.code', 'dest.nom', 'dest.ville', 'dest.pays')
            ->orderByDesc('pax')
            ->get();

        return response()->json($rows);
    }

    public function tauxRemplissage(Request $request)
    {
        $rows = $this->escalesPeriode($request)
            ->join('aeronefs', 'vols.aeronef_id', '=', 'aeronefs.id')
            ->join('aeroports as dep', 'escales.aeroport_depart_id', '=', 'dep.id')
            ->join('aeroports as arr', 'escales.aeroport_arrivee_id', '=', 'arr.id')
            ->selectRaw("compagnies.nom as compagnie")
            ->selectRaw("CONCAT(dep.code, ' - ', arr.code) as ligne")
            ->selectRaw('SUM(escales.pax_effectifs) as pax')
            ->selectRaw('SUM(aeronefs.capacite) as capacite')
            ->selectRaw('COUNT(*) as vols')
            ->groupBy('compagnies.id', 'compagnies.nom', 'dep.code', 'arr.code')
            ->get()
            ->map(function ($r) {
                $r->taux = $r->capacite > 0 ? round($r->pax / $r->capacite * 100, 2) : 0;
                return $r;
            })
            ->sortByDesc('taux')
            ->values();

        return response()->json($rows);
    }

    public function repartitionCompagnies(Request $request)
    {
        $rows = $this->escalesPeriode($request)
            ->selectRaw('compagnies.nom as compagnie')
            ->selectRaw('SUM(escales.pax_embarques + escales.pax_debarques) as pax')
            ->selectRaw('SUM(escales.fret) as fret')
            ->selectRaw('COUNT(DISTINCT vols.id) as mouvements')
            ->groupBy('compagnies.id', 'compagnies.nom')
            ->orderByDesc('pax')
            ->get();

        $totalPax = max(1, $rows->sum('pax'));
        $totalFret = max(1, $rows->sum('fret'));
        $totalMvt = max(1, $rows->sum('mouvements'));

        $rows->each(function ($r) use ($totalPax, $totalFret, $totalMvt) {
            $r->part_pax = round($r->pax / $totalPax * 100, 2);
            $r->part_fret = round($r->fret / $totalFret * 100, 2);
            $r->part_mouvements = round($r->mouvements / $totalMvt * 100, 2);
        });

        return response()->json($rows);
    }

    public function factures(Request $request)
    {
        $reference = $this->aeroportReference($request);

        $rows = $this->escalesPeriode($request)
            ->when($reference, fn ($q) => $q->where('escales.aeroport_depart_id', $reference))
            ->selectRaw('compagnies.nom as compagnie')
            ->selectRaw('SUM(escales.pax_redevance) as pax_redevance')
            ->selectRaw('COUNT(DISTINCT vols.id) as vols')
            ->groupBy('compagnies.id', 'compagnies.nom')
            ->havingRaw('SUM(escales.pax_redevance) > 0')
            ->get()
            ->map(function ($r) {
                $r->tarif_unitaire = self::TARIF_REDEVANCE_PAX;
                $r->montant = $r->pax_redevance * self::TARIF_REDEVANCE_PAX;
                return $r;
            });

        return response()->json([
            'aeroport_reference' => $reference ? Aeroport::find($reference) : null,
            'factures' => $rows->values(),
        ]);
    }

    public function aeronefsParAeroport(Request $request)
    {
        $request->validate(['aeroport_id' => 'required|exists:aeroports,id']);

        $aeronefs = Escale::query()
            ->join('vols', 'escales.vol_id', '=', 'vols.id')
            ->join('aeronefs', 'vols.aeronef_id', '=', 'aeronefs.id')
            ->join('compagnies', 'aeronefs.compagnie_id', '=', 'compagnies.id')
            ->where(function ($q) use ($request) {
                $q->where('escales.aeroport_depart_id', $request->aeroport_id)
                    ->orWhere('escales.aeroport_arrivee_id', $request->aeroport_id);
            })
            ->select('aeronefs.id', 'aeronefs.immatriculation', 'aeronefs.modele', 'aeronefs.capacite', 'compagnies.nom as compagnie')
            ->distinct()
            ->orderBy('compagnies.nom')
            ->get();

        return response()->json($aeronefs);
    }

    public function statistiquesDemandes(Request $request)
    {
        $base = Demande::query()
            ->when($request->filled('date_debut'), fn ($q) => $q->whereDate('created_at', '>=', $request->date_debut))
            ->when($request->filled('date_fin'), fn ($q) => $q->whereDate('created_at', '<=', $request->date_fin));

        $parStatut = (clone $base)->select('statut', DB::raw('COUNT(*) as total'))->groupBy('statut')->pluck('total', 'statut');

        $parType = (clone $base)->select('type', DB::raw('COUNT(*) as total'))->groupBy('type')->pluck('total', 'type');

        $parDemandeur = (clone $base)
            ->leftJoin('compagnies', 'demandes.compagnie_id', '=', 'compagnies.id')
            ->select('demandes.demandeur_type', 'compagnies.nom as compagnie', 'demandes.demandeur_nom', DB::raw('COUNT(*) as total'))
            ->groupBy('demandes.demandeur_type', 'compagnies.nom', 'demandes.demandeur_nom')
            ->orderByDesc('total')
            ->get();

        $parDestination = (clone $base)
            ->leftJoin('aeroports as dest', 'demandes.aeroport_destination_id', '=', 'dest.id')
            ->leftJoin('aeroports as prov', 'demandes.aeroport_provenance_id', '=', 'prov.id')
            ->selectRaw("COALESCE(prov.code, '-') as provenance")
            ->selectRaw("COALESCE(dest.code, '-') as destination")
            ->selectRaw('demandes.demandeur_type')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('prov.code', 'dest.code', 'demandes.demandeur_type')
            ->orderByDesc('total')
            ->get();

        $facturation = (clone $base)
            ->where('statut', 'autorisee')
            ->selectRaw('COUNT(*) as autorisations')
            ->selectRaw('SUM(montant_facture) as total_facture')
            ->first();

        return response()->json([
            'par_statut' => $parStatut,
            'par_type' => $parType,
            'par_demandeur' => $parDemandeur,
            'par_destination' => $parDestination,
            'facturation' => $facturation,
        ]);
    }

    private function escalesPeriode(Request $request)
    {
        return Escale::query()
            ->join('vols', 'escales.vol_id', '=', 'vols.id')
            ->join('compagnies', 'vols.compagnie_id', '=', 'compagnies.id')
            ->when($request->filled('date_debut'), fn ($q) => $q->whereDate('vols.date_vol', '>=', $request->date_debut))
            ->when($request->filled('date_fin'), fn ($q) => $q->whereDate('vols.date_vol', '<=', $request->date_fin))
            ->when($request->filled('compagnie_id'), fn ($q) => $q->where('vols.compagnie_id', $request->compagnie_id));
    }

    private function aeroportReference(Request $request): ?int
    {
        if ($request->filled('aeroport_id')) {
            return (int) $request->aeroport_id;
        }

        return Parametre::instance()->aeroport_reference_id;
    }
}
