<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RepresentantAgree extends Model
{
    protected $table = 'representant_agrees';

    protected $fillable = ['nom', 'organisme', 'telephone', 'email', 'adresse'];

    public function demandes()
    {
        return $this->hasMany(Demande::class, 'representant_id');
    }
}
