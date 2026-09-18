<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Demande extends Model
{
    public const TYPES = ['survol', 'atterrissage', 'survol_atterrissage'];
    public const DEMANDEUR_TYPES = ['compagnie', 'operateur', 'representant_diplomatique'];
    public const STATUTS = ['en_attente', 'autorisee', 'refusee', 'annulee'];

    // Libellés des champs complémentaires (details) exigés selon la nature du vol
    public const DETAIL_LABELS = [
        'itineraire' => 'Itinéraire complet',
        'date_depart' => 'Date de départ',
        'heure_arrivee' => "Heure estimée d'arrivée",
        'heure_depart' => 'Heure estimée de départ',
        'nature_cargaison' => 'Nature de la cargaison',
        'quantite_cargaison' => 'Quantité de cargaison',
        'masse_cargaison' => 'Masse de la cargaison (kg)',
        'affreteur' => 'Affréteur',
        'destinataire' => 'Destinataire',
        'nombre_vols' => 'Nombre de vols',
        'periode' => 'Période',
        'partenaires_senegal' => 'Partenaires au Sénégal',
        'hebergement_passagers' => "Site d'hébergement des passagers",
        'representant_senegal' => 'Représentant au Sénégal (nom et adresse)',
        'nature_navigabilite' => 'Nature du certificat de navigabilité',
        'validite_navigabilite' => 'Limite de validité du certificat de navigabilité',
        'reference_assurance' => "Références de la police d'assurance",
        'validite_assurance' => "Limite de validité de l'assurance",
        'proprietaire_exploitant' => "Propriétaire / exploitant de l'aéronef",
        'licences_equipage' => "Licences des membres d'équipage",
        'zones_evolution' => "Zones d'évolution et altitudes",
        'equipements_aeronef' => 'Équipements spécifiques des aéronefs',
        'autres_autorisations' => 'Autres autorisations obtenues',
        'nombre_passagers' => 'Nombre de passagers',
        'passagers_details' => 'Identité et qualité des passagers à bord',
        'equipements_bord' => 'Équipements à bord',
        'but_atterrissage' => "But de l'atterrissage",
    ];

    // Libellés des pièces jointes exigées selon la nature du vol
    public const DOC_LABELS = [
        'docs_compagnie' => 'Documents de la compagnie (agrément, PEA, spécifications opérationnelles)',
        'docs_aeronef' => "Documents des aéronefs (certificat d'immatriculation, navigabilité, licences station, assurance)",
        'lettre_introduction' => "Lettre d'introduction et contrat de l'organisme officiel",
        'avis_ministres' => 'Avis favorables des ministres (Intérieur, Forces Armées, Communication)',
        'certificat_travail' => 'Certificat de travail aérien',
    ];

    protected $fillable = [
        'numero', 'type', 'demandeur_type', 'compagnie_id', 'representant_id',
        'demandeur_nom', 'objet', 'numero_vol', 'nature_vol_id', 'immatriculation', 'type_aeronef',
        'aeroport_provenance_id', 'aeroport_destination_id', 'date_vol', 'poids_fret',
        'details', 'statut', 'numero_autorisation', 'montant_facture', 'motif_refus',
        'traite_par', 'date_traitement', 'observations', 'created_by',
    ];

    protected $casts = [
        'date_vol' => 'date',
        'date_traitement' => 'datetime',
        'details' => 'array',
    ];

    public function compagnie()
    {
        return $this->belongsTo(Compagnie::class);
    }

    public function representant()
    {
        return $this->belongsTo(RepresentantAgree::class, 'representant_id');
    }

    public function natureVol()
    {
        return $this->belongsTo(NatureVol::class);
    }

    public function aeroportProvenance()
    {
        return $this->belongsTo(Aeroport::class, 'aeroport_provenance_id');
    }

    public function aeroportDestination()
    {
        return $this->belongsTo(Aeroport::class, 'aeroport_destination_id');
    }

    public function traitePar()
    {
        return $this->belongsTo(User::class, 'traite_par');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function documents()
    {
        return $this->hasMany(DemandeDocument::class);
    }

    public function getDemandeurLibelleAttribute(): string
    {
        return match ($this->demandeur_type) {
            'compagnie' => $this->compagnie?->nom ?? '-',
            'representant_diplomatique' => $this->representant?->nom ?? '-',
            default => $this->demandeur_nom ?? '-',
        };
    }
}
