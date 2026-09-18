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
        Schema::create('vols', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 20);
            $table->foreignId('nature_vol_id')->nullable()->constrained('nature_vols')->nullOnDelete();
            $table->foreignId('aeronef_id')->constrained('aeronefs')->cascadeOnDelete();
            $table->foreignId('compagnie_id')->constrained('compagnies')->cascadeOnDelete();
            $table->date('date_vol');
            $table->time('heure_depart')->nullable();
            $table->time('heure_arrivee')->nullable();
            $table->text('observations')->nullable();
            $table->timestamps();

            $table->index(['date_vol', 'compagnie_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vols');
    }
};
