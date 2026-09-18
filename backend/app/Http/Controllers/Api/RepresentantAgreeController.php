<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RepresentantAgree;
use Illuminate\Http\Request;

class RepresentantAgreeController extends Controller
{
    public function index(Request $request)
    {
        $query = RepresentantAgree::query()->orderBy('nom');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('nom', 'like', "%$s%")
                    ->orWhere('organisme', 'like', "%$s%");
            });
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'organisme' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'adresse' => 'nullable|string|max:255',
        ]);

        return response()->json(RepresentantAgree::create($data), 201);
    }

    public function show(RepresentantAgree $representantAgree)
    {
        return response()->json($representantAgree);
    }

    public function update(Request $request, RepresentantAgree $representantAgree)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'organisme' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'adresse' => 'nullable|string|max:255',
        ]);

        $representantAgree->update($data);

        return response()->json($representantAgree);
    }

    public function destroy(RepresentantAgree $representantAgree)
    {
        $representantAgree->delete();

        return response()->json(['message' => 'Représentant supprimé']);
    }
}
