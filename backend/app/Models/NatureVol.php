<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NatureVol extends Model
{
    protected $table = 'nature_vols';

    protected $fillable = ['libelle', 'code'];
}
