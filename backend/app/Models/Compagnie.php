<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Compagnie extends Model
{
    public const TYPES = ['regulier', 'irregulier', 'cargo', 'charter'];

    protected $fillable = ['nom', 'code_iata', 'code_oaci', 'responsable', 'type'];

    public function aeronefs()
    {
        return $this->hasMany(Aeronef::class);
    }

    public function vols()
    {
        return $this->hasMany(Vol::class);
    }

    public function demandes()
    {
        return $this->hasMany(Demande::class);
    }
}
