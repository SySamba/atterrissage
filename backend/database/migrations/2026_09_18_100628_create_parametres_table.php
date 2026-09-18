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
        Schema::create('parametres', function (Blueprint $table) {
            $table->id();
            $table->string('exploitant')->nullable();
            $table->string('service')->nullable();
            $table->string('telephone')->nullable();
            $table->string('fax')->nullable();
            $table->string('email')->nullable();
            $table->string('source_donnees')->nullable();
            $table->string('logo')->nullable();
            $table->foreignId('aeroport_reference_id')->nullable()->constrained('aeroports')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parametres');
    }
};
