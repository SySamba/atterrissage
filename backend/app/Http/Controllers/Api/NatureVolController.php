<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NatureVol;
use Illuminate\Http\Request;

class NatureVolController extends Controller
{
    public function index()
    {
        return response()->json(NatureVol::orderBy('libelle')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'libelle' => 'required|string|max:255|unique:nature_vols,libelle',
        ]);

        return response()->json(NatureVol::create($data), 201);
    }

    public function update(Request $request, NatureVol $natureVol)
    {
        $data = $request->validate([
            'libelle' => 'required|string|max:255|unique:nature_vols,libelle,'.$natureVol->id,
        ]);

        $natureVol->update($data);

        return response()->json($natureVol);
    }

    public function destroy(NatureVol $natureVol)
    {
        $natureVol->delete();

        return response()->json(['message' => 'Nature de vol supprimée']);
    }
}
