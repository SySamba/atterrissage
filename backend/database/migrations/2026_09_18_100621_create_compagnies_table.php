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
        Schema::create('compagnies', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('code_iata', 5)->nullable();
            $table->string('code_oaci', 5)->nullable();
            $table->string('responsable')->nullable();
            $table->enum('type', ['regulier', 'irregulier', 'cargo', 'charter'])->default('regulier');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compagnies');
    }
};
