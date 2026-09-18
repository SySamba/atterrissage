<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vol extends Model
{
    protected $table = 'vols';

    protected $fillable = [
        'numero', 'nature_vol_id', 'aeronef_id', 'compagnie_id',
        'date_vol', 'heure_depart', 'heure_arrivee', 'observations',
    ];

    protected $casts = [
        'date_vol' => 'date',
    ];

    public function natureVol()
    {
        return $this->belongsTo(NatureVol::class);
    }

    public function aeronef()
    {
        return $this->belongsTo(Aeronef::class);
    }

    public function compagnie()
    {
        return $this->belongsTo(Compagnie::class);
    }

    public function escales()
    {
        return $this->hasMany(Escale::class)->orderBy('ordre');
    }
}
