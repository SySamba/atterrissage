<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aeroport extends Model
{
    protected $fillable = ['nom', 'code', 'ville', 'pays'];

    public function escalesDepart()
    {
        return $this->hasMany(Escale::class, 'aeroport_depart_id');
    }

    public function escalesArrivee()
    {
        return $this->hasMany(Escale::class, 'aeroport_arrivee_id');
    }
}
