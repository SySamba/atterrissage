<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemandeDocument extends Model
{
    protected $fillable = ['demande_id', 'champ', 'nom_original', 'chemin'];

    public function demande()
    {
        return $this->belongsTo(Demande::class);
    }
}
