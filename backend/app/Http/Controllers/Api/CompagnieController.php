<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Compagnie;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CompagnieController extends Controller
{
    public function index(Request $request)
    {
        $query = Compagnie::query()->withCount('aeronefs')->orderBy('nom');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('nom', 'like', "%$s%")
                    ->orWhere('code_iata', 'like', "%$s%")
                    ->orWhere('code_oaci', 'like', "%$s%");
            });
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'code_iata' => 'nullable|string|max:5',
            'code_oaci' => 'nullable|string|max:5',
            'responsable' => 'nullable|string|max:255',
            'type' => ['required', Rule::in(Compagnie::TYPES)],
        ]);

        return response()->json(Compagnie::create($data), 201);
    }

    public function show(Compagnie $compagnie)
    {
        return response()->json($compagnie->load('aeronefs'));
    }

    public function update(Request $request, Compagnie $compagnie)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'code_iata' => 'nullable|string|max:5',
            'code_oaci' => 'nullable|string|max:5',
            'responsable' => 'nullable|string|max:255',
            'type' => ['required', Rule::in(Compagnie::TYPES)],
        ]);

        $compagnie->update($data);

        return response()->json($compagnie);
    }

    public function destroy(Compagnie $compagnie)
    {
        $compagnie->delete();

        return response()->json(['message' => 'Compagnie supprimée']);
    }
}
