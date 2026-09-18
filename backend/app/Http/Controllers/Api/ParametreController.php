<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Parametre;
use Illuminate\Http\Request;

class ParametreController extends Controller
{
    public function show()
    {
        return response()->json(Parametre::instance()->load('aeroportReference'));
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'exploitant' => 'nullable|string|max:255',
            'service' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:50',
            'fax' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'source_donnees' => 'nullable|string|max:255',
            'logo' => 'nullable|string|max:255',
            'aeroport_reference_id' => 'nullable|exists:aeroports,id',
            'tarif_survol' => 'nullable|numeric|min:0',
            'tarif_atterrissage' => 'nullable|numeric|min:0',
            'tarif_survol_atterrissage' => 'nullable|numeric|min:0',
        ]);

        $parametre = Parametre::instance();
        $parametre->update($data);

        return response()->json($parametre->load('aeroportReference'));
    }
}
