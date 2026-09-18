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
        Schema::create('escales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vol_id')->constrained('vols')->cascadeOnDelete();
            $table->unsignedInteger('ordre')->default(1);
            $table->foreignId('aeroport_depart_id')->constrained('aeroports')->cascadeOnDelete();
            $table->foreignId('aeroport_arrivee_id')->constrained('aeroports')->cascadeOnDelete();
            $table->unsignedInteger('pax_embarques')->default(0);
            $table->unsignedInteger('pax_debarques')->default(0);
            $table->unsignedInteger('pax_effectifs')->default(0);
            $table->unsignedInteger('pax_transit')->default(0);
            $table->unsignedInteger('billets_gratuits')->default(0);
            $table->unsignedInteger('bebes')->default(0);
            $table->unsignedInteger('pax_redevance')->default(0);
            $table->decimal('poste', 10, 2)->default(0);
            $table->decimal('fret', 10, 2)->default(0);
            $table->text('observations')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('escales');
    }
};
