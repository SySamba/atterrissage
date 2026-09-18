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
        Schema::create('aeronefs', function (Blueprint $table) {
            $table->id();
            $table->string('immatriculation', 20)->unique();
            $table->foreignId('compagnie_id')->constrained('compagnies')->cascadeOnDelete();
            $table->string('modele')->nullable();
            $table->unsignedInteger('capacite')->default(0);
            $table->text('observations')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aeronefs');
    }
};
