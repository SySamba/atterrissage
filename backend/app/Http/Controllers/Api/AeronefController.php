<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aeronef;
use Illuminate\Http\Request;

class AeronefController extends Controller
{
    public function index(Request $request)
    {
        $query = Aeronef::query()->with('compagnie')->orderBy('immatriculation');

        if ($request->filled('compagnie_id')) {
            $query->where('compagnie_id', $request->compagnie_id);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('immatriculation', 'like', "%$s%")
                    ->orWhere('modele', 'like', "%$s%");
            });
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'immatriculation' => 'required|string|max:20|unique:aeronefs,immatriculation',
            'compagnie_id' => 'required|exists:compagnies,id',
            'modele' => 'nullable|string|max:255',
            'capacite' => 'nullable|integer|min:0',
            'observations' => 'nullable|string',
        ]);

        return response()->json(Aeronef::create($data)->load('compagnie'), 201);
    }

    public function show(Aeronef $aeronef)
    {
        return response()->json($aeronef->load('compagnie'));
    }

    public function update(Request $request, Aeronef $aeronef)
    {
        $data = $request->validate([
            'immatriculation' => 'required|string|max:20|unique:aeronefs,immatriculation,'.$aeronef->id,
            'compagnie_id' => 'required|exists:compagnies,id',
            'modele' => 'nullable|string|max:255',
            'capacite' => 'nullable|integer|min:0',
            'observations' => 'nullable|string',
        ]);

        $aeronef->update($data);

        return response()->json($aeronef->load('compagnie'));
    }

    public function destroy(Aeronef $aeronef)
    {
        $aeronef->delete();

        return response()->json(['message' => 'Aéronef supprimé']);
    }
}
