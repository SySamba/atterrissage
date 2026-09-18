<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('demandes', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 30)->unique();
            $table->enum('type', ['survol', 'atterrissage', 'survol_atterrissage'])->default('survol_atterrissage');
            $table->enum('demandeur_type', ['compagnie', 'operateur', 'representant_diplomatique'])->default('compagnie');
            $table->foreignId('compagnie_id')->nullable()->constrained('compagnies')->nullOnDelete();
            $table->foreignId('representant_id')->nullable()->constrained('representant_agrees')->nullOnDelete();
            $table->string('demandeur_nom')->nullable();
            $table->text('objet')->nullable();
            $table->foreignId('nature_vol_id')->nullable()->constrained('nature_vols')->nullOnDelete();
            $table->string('immatriculation', 20)->nullable();
            $table->string('type_aeronef')->nullable();
            $table->foreignId('aeroport_provenance_id')->nullable()->constrained('aeroports')->nullOnDelete();
            $table->foreignId('aeroport_destination_id')->nullable()->constrained('aeroports')->nullOnDelete();
            $table->date('date_vol')->nullable();
            $table->decimal('poids_fret', 10, 2)->default(0);
            $table->enum('statut', ['en_attente', 'autorisee', 'refusee', 'annulee'])->default('en_attente');
            $table->string('numero_autorisation', 30)->nullable();
            $table->decimal('montant_facture', 12, 2)->nullable();
            $table->string('motif_refus')->nullable();
            $table->foreignId('traite_par')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('date_traitement')->nullable();
            $table->text('observations')->nullable();
            $table->timestamps();

            $table->index(['statut', 'date_vol']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demandes');
    }
};
