<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aeronef;
use App\Models\Vol;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VolController extends Controller
{
    public function index(Request $request)
    {
        $query = Vol::query()
            ->with(['compagnie', 'aeronef', 'natureVol', 'escales.aeroportDepart', 'escales.aeroportArrivee'])
            ->orderByDesc('date_vol')
            ->orderByDesc('id');

        if ($request->filled('date_debut')) {
            $query->whereDate('date_vol', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('date_vol', '<=', $request->date_fin);
        }

        if ($request->filled('nature_vol_id')) {
            $query->where('nature_vol_id', $request->nature_vol_id);
        }

        if ($request->filled('compagnie_id')) {
            $query->where('compagnie_id', $request->compagnie_id);
        }

        if ($request->filled('aeronef_id')) {
            $query->where('aeronef_id', $request->aeronef_id);
        }

        if ($request->filled('aeroport_id')) {
            $query->whereHas('escales', function ($q) use ($request) {
                $q->where('aeroport_depart_id', $request->aeroport_id)
                    ->orWhere('aeroport_arrivee_id', $request->aeroport_id);
            });
        }

        if ($request->filled('numero')) {
            $query->where('numero', 'like', '%'.$request->numero.'%');
        }

        return response()->json($query->paginate($request->integer('per_page', 15)));
    }

    public function store(Request $request)
    {
        $data = $this->validateVol($request);

        $vol = DB::transaction(function () use ($data) {
            $vol = Vol::create($data);
            $this->syncEscales($vol, $data['escales'] ?? []);

            return $vol;
        });

        return response()->json($vol->load(['compagnie', 'aeronef', 'natureVol', 'escales.aeroportDepart', 'escales.aeroportArrivee']), 201);
    }

    public function show(Vol $vol)
    {
        return response()->json($vol->load(['compagnie', 'aeronef', 'natureVol', 'escales.aeroportDepart', 'escales.aeroportArrivee']));
    }

    public function update(Request $request, Vol $vol)
    {
        $data = $this->validateVol($request);

        DB::transaction(function () use ($vol, $data) {
            $vol->update($data);
            if (array_key_exists('escales', $data)) {
                $vol->escales()->delete();
                $this->syncEscales($vol, $data['escales']);
            }
        });

        return response()->json($vol->load(['compagnie', 'aeronef', 'natureVol', 'escales.aeroportDepart', 'escales.aeroportArrivee']));
    }

    public function destroy(Vol $vol)
    {
        $vol->delete();

        return response()->json(['message' => 'Vol supprimé']);
    }

    private function validateVol(Request $request): array
    {
        $data = $request->validate([
            'numero' => 'required|string|max:20',
            'nature_vol_id' => 'nullable|exists:nature_vols,id',
            'aeronef_id' => 'required|exists:aeronefs,id',
            'date_vol' => 'required|date',
            'heure_depart' => 'nullable|date_format:H:i',
            'heure_arrivee' => 'nullable|date_format:H:i',
            'observations' => 'nullable|string',
            'escales' => 'nullable|array',
            'escales.*.aeroport_depart_id' => 'required|exists:aeroports,id',
            'escales.*.aeroport_arrivee_id' => 'required|exists:aeroports,id',
            'escales.*.pax_embarques' => 'nullable|integer|min:0',
            'escales.*.pax_debarques' => 'nullable|integer|min:0',
            'escales.*.pax_effectifs' => 'nullable|integer|min:0',
            'escales.*.pax_transit' => 'nullable|integer|min:0',
            'escales.*.billets_gratuits' => 'nullable|integer|min:0',
            'escales.*.bebes' => 'nullable|integer|min:0',
            'escales.*.pax_redevance' => 'nullable|integer|min:0',
            'escales.*.poste' => 'nullable|numeric|min:0',
            'escales.*.fret' => 'nullable|numeric|min:0',
            'escales.*.observations' => 'nullable|string',
        ]);

        // La compagnie est déduite de l'aéronef choisi (lien compagnie -> avions)
        $data['compagnie_id'] = Aeronef::findOrFail($data['aeronef_id'])->compagnie_id;

        // Le champ « PAX payant la redevance » n'est actif que si l'aéroport
        // de départ correspond à l'aéroport de référence (manuel GESTAT III.4)
        $referenceId = \App\Models\Parametre::instance()->aeroport_reference_id;
        foreach ($data['escales'] ?? [] as $i => $escale) {
            if ((int) ($escale['pax_redevance'] ?? 0) > 0
                && (int) $escale['aeroport_depart_id'] !== (int) $referenceId) {
                throw ValidationException::withMessages([
                    "escales.$i.pax_redevance" => ["Les PAX payant la redevance ne sont saisissables qu'au départ de l'aéroport de référence."],
                ]);
            }
        }

        return $data;
    }

    private function syncEscales(Vol $vol, array $escales): void
    {
        foreach (array_values($escales) as $i => $escale) {
            $vol->escales()->create(array_merge($escale, ['ordre' => $i + 1]));
        }
    }
}
