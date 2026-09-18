<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aeronef extends Model
{
    protected $fillable = ['immatriculation', 'compagnie_id', 'modele', 'capacite', 'observations'];

    public function compagnie()
    {
        return $this->belongsTo(Compagnie::class);
    }

    public function vols()
    {
        return $this->hasMany(Vol::class);
    }
}
