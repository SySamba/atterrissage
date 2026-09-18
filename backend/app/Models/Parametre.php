<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Parametre extends Model
{
    protected $fillable = [
        'exploitant', 'service', 'telephone', 'fax', 'email',
        'source_donnees', 'logo', 'aeroport_reference_id',
        'tarif_survol', 'tarif_atterrissage', 'tarif_survol_atterrissage',
    ];

    public function aeroportReference()
    {
        return $this->belongsTo(Aeroport::class, 'aeroport_reference_id');
    }

    public static function instance(): self
    {
        return static::firstOrCreate([]);
    }
}
