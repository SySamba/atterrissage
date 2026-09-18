<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parametres', function (Blueprint $table) {
            $table->decimal('tarif_survol', 12, 2)->default(200000)->after('aeroport_reference_id');
            $table->decimal('tarif_atterrissage', 12, 2)->default(200000)->after('tarif_survol');
            $table->decimal('tarif_survol_atterrissage', 12, 2)->default(300000)->after('tarif_atterrissage');
        });
    }

    public function down(): void
    {
        Schema::table('parametres', function (Blueprint $table) {
            $table->dropColumn(['tarif_survol', 'tarif_atterrissage', 'tarif_survol_atterrissage']);
        });
    }
};
