<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->orderBy('name');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => ['required', Password::min(6)],
            'role' => ['required', Rule::in(['admin', 'agent', 'demandeur'])],
            'actif' => 'boolean',
        ]);

        return response()->json(User::create($data), 201);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,'.$user->id,
            'password' => ['nullable', Password::min(6)],
            'role' => ['required', Rule::in(['admin', 'agent', 'demandeur'])],
            'actif' => 'boolean',
        ]);

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json($user);
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé']);
    }
}
