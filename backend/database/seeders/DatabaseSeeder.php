<?php

namespace Database\Seeders;

use App\Models\Aeroport;
use App\Models\NatureVol;
use App\Models\Parametre;
use App\Models\Sequence;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ---------- Utilisateurs ----------
        User::create([
            'name' => 'Administrateur',
            'email' => 'admin@adac.td',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Agent Bureau Survol',
            'email' => 'agent@adac.td',
            'password' => Hash::make('password'),
            'role' => 'agent',
        ]);

        // ---------- Aéroports (données de référence réelles) ----------
        $aeroports = collect([
            ['nom' => 'Aéroport International de N\'Djamena', 'code' => 'NDJ', 'ville' => 'N\'Djamena', 'pays' => 'Tchad'],
            ['nom' => 'Aéroport d\'Abéché', 'code' => 'AEH', 'ville' => 'Abéché', 'pays' => 'Tchad'],
            ['nom' => 'Aéroport de Moundou', 'code' => 'MQQ', 'ville' => 'Moundou', 'pays' => 'Tchad'],
            ['nom' => 'Aéroport de Sarh', 'code' => 'SRH', 'ville' => 'Sarh', 'pays' => 'Tchad'],
            ['nom' => 'Aéroport International Blaise Diagne', 'code' => 'DSS', 'ville' => 'Dakar', 'pays' => 'Sénégal'],
            ['nom' => 'Aéroport Léopold Sédar Senghor', 'code' => 'DKR', 'ville' => 'Dakar', 'pays' => 'Sénégal'],
            ['nom' => 'Aéroport Charles de Gaulle', 'code' => 'CDG', 'ville' => 'Paris', 'pays' => 'France'],
            ['nom' => 'Aéroport de Nouakchott-Oumtounsy', 'code' => 'NKC', 'ville' => 'Nouakchott', 'pays' => 'Mauritanie'],
            ['nom' => 'Aéroport de Conakry', 'code' => 'CKY', 'ville' => 'Conakry', 'pays' => 'Guinée'],
            ['nom' => 'Aéroport Lomé-Tokoin', 'code' => 'LFW', 'ville' => 'Lomé', 'pays' => 'Togo'],
            ['nom' => 'Aéroport Félix Houphouët-Boigny', 'code' => 'ABJ', 'ville' => 'Abidjan', 'pays' => "Côte d'Ivoire"],
            ['nom' => 'Aéroport Modibo Keïta', 'code' => 'BKO', 'ville' => 'Bamako', 'pays' => 'Mali'],
            ['nom' => 'Aéroport de Ouagadougou', 'code' => 'OUA', 'ville' => 'Ouagadougou', 'pays' => 'Burkina Faso'],
            ['nom' => 'Aéroport Diori Hamani', 'code' => 'NIM', 'ville' => 'Niamey', 'pays' => 'Niger'],
            ['nom' => 'Aéroport de Cotonou', 'code' => 'COO', 'ville' => 'Cotonou', 'pays' => 'Bénin'],
            ['nom' => 'Aéroport Mohammed V', 'code' => 'CMN', 'ville' => 'Casablanca', 'pays' => 'Maroc'],
            ['nom' => 'Aéroport d\'Istanbul', 'code' => 'IST', 'ville' => 'Istanbul', 'pays' => 'Turquie'],
            ['nom' => 'Aéroport de Bole', 'code' => 'ADD', 'ville' => 'Addis-Abeba', 'pays' => 'Éthiopie'],
            ['nom' => 'Aéroport de Praia', 'code' => 'RAI', 'ville' => 'Praia', 'pays' => 'Cap-Vert'],
            ['nom' => 'Aéroport de Bissau', 'code' => 'OXB', 'ville' => 'Bissau', 'pays' => 'Guinée-Bissau'],
            ['nom' => 'Aéroport International Bangui M\'Poko', 'code' => 'BGF', 'ville' => 'Bangui', 'pays' => 'Centrafrique'],
            ['nom' => 'Aéroport International de Douala', 'code' => 'DLA', 'ville' => 'Douala', 'pays' => 'Cameroun'],
            ['nom' => 'Aéroport International de Yaoundé-Nsimalen', 'code' => 'NSI', 'ville' => 'Yaoundé', 'pays' => 'Cameroun'],
            ['nom' => 'Aéroport International Nnamdi Azikiwe', 'code' => 'ABV', 'ville' => 'Abuja', 'pays' => 'Nigeria'],
            ['nom' => 'Aéroport International Murtala Muhammed', 'code' => 'LOS', 'ville' => 'Lagos', 'pays' => 'Nigeria'],
            ['nom' => 'Aéroport International de Khartoum', 'code' => 'KRT', 'ville' => 'Khartoum', 'pays' => 'Soudan'],
            ['nom' => 'Aéroport International du Caire', 'code' => 'CAI', 'ville' => 'Le Caire', 'pays' => 'Égypte'],
            ['nom' => 'Aéroport Léon M\'ba', 'code' => 'LBV', 'ville' => 'Libreville', 'pays' => 'Gabon'],
        ])->mapWithKeys(fn ($a) => [$a['code'] => Aeroport::create($a)]);

        // ---------- Natures de vol ----------
        collect([
            ['libelle' => 'Commercial non régulier', 'code' => 'commercial'],
            ['libelle' => 'Diplomatique', 'code' => 'diplomatique'],
            ['libelle' => 'Travail aérien', 'code' => 'travail'],
            ['libelle' => 'Privé', 'code' => 'prive'],
        ])->each(fn ($n) => NatureVol::create($n));

        // ---------- Séquences (numérotation des demandes / autorisations) ----------
        Sequence::create(['name' => 'demande', 'year' => (int) now()->year, 'value' => 0]);
        Sequence::create(['name' => 'autorisation', 'year' => (int) now()->year, 'value' => 0]);

        // ---------- Paramétrage ----------
        Parametre::create([
            'exploitant' => 'Autorité de l\'Aviation Civile (ADAC) — République du Tchad',
            'service' => 'Direction du Transport Aérien',
            'telephone' => '+235 22 52 43 21',
            'fax' => '+235 22 52 43 30',
            'email' => 'contact@adac.td',
            'source_donnees' => 'ASECNA et sociétés d\'assistance en escale',
            'aeroport_reference_id' => $aeroports['NDJ']->id,
            'tarif_survol' => 200000,
            'tarif_atterrissage' => 200000,
            'tarif_survol_atterrissage' => 300000,
        ]);
    }
}
