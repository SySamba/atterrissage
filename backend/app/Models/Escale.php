<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Escale extends Model
{
    protected $fillable = [
        'vol_id', 'ordre', 'aeroport_depart_id', 'aeroport_arrivee_id',
        'pax_embarques', 'pax_debarques', 'pax_effectifs', 'pax_transit',
        'billets_gratuits', 'bebes', 'pax_redevance', 'poste', 'fret', 'observations',
    ];

    public function vol()
    {
        return $this->belongsTo(Vol::class);
    }

    public function aeroportDepart()
    {
        return $this->belongsTo(Aeroport::class, 'aeroport_depart_id');
    }

    public function aeroportArrivee()
    {
        return $this->belongsTo(Aeroport::class, 'aeroport_arrivee_id');
    }
}
