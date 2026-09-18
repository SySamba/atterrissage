<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aeroport;
use Illuminate\Http\Request;

class AeroportController extends Controller
{
    public function index(Request $request)
    {
        $query = Aeroport::query()->orderBy('code');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('nom', 'like', "%$s%")
                    ->orWhere('code', 'like', "%$s%")
                    ->orWhere('ville', 'like', "%$s%")
                    ->orWhere('pays', 'like', "%$s%");
            });
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:aeroports,code',
            'ville' => 'required|string|max:255',
            'pays' => 'required|string|max:255',
        ]);

        return response()->json(Aeroport::create($data), 201);
    }

    public function show(Aeroport $aeroport)
    {
        return response()->json($aeroport);
    }

    public function update(Request $request, Aeroport $aeroport)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:aeroports,code,'.$aeroport->id,
            'ville' => 'required|string|max:255',
            'pays' => 'required|string|max:255',
        ]);

        $aeroport->update($data);

        return response()->json($aeroport);
    }

    public function destroy(Aeroport $aeroport)
    {
        $aeroport->delete();

        return response()->json(['message' => 'Aéroport supprimé']);
    }
}
