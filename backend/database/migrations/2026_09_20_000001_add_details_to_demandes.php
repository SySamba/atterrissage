<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            $table->string('numero_vol')->nullable()->after('objet');
            $table->json('details')->nullable();
        });

        Schema::table('nature_vols', function (Blueprint $table) {
            $table->string('code', 30)->nullable()->unique();
        });

        Schema::create('demande_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_id')->constrained('demandes')->cascadeOnDelete();
            $table->string('champ');
            $table->string('nom_original');
            $table->string('chemin');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demande_documents');
        Schema::table('nature_vols', function (Blueprint $table) {
            $table->dropColumn('code');
        });
        Schema::table('demandes', function (Blueprint $table) {
            $table->dropColumn(['numero_vol', 'details']);
        });
    }
};
