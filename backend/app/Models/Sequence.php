<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Sequence extends Model
{
    protected $fillable = ['name', 'year', 'value'];

    /**
     * Incrémente et retourne la prochaine valeur d'une séquence.
     * Doit être appelé à l'intérieur d'une transaction : le verrou
     * FOR UPDATE garantit l'unicité même en cas de requêtes concurrentes.
     */
    public static function next(string $name, ?int $year = null): int
    {
        $year = $year ?? (int) now()->year;

        $seq = static::where('name', $name)->where('year', $year)->lockForUpdate()->first();

        if (! $seq) {
            // Création de la ligne de séquence ; en cas de course, le second
            // insert échoue sur l'index unique et réessaie en verrouillant.
            try {
                $seq = static::create(['name' => $name, 'year' => $year, 'value' => 0]);
            } catch (\Illuminate\Database\QueryException $e) {
                $seq = static::where('name', $name)->where('year', $year)->lockForUpdate()->firstOrFail();
            }
        }

        $seq->increment('value');

        return (int) $seq->value;
    }
}
