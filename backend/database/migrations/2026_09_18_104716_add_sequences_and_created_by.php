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
        Schema::create('sequences', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->unsignedInteger('year');
            $table->unsignedBigInteger('value')->default(0);
            $table->timestamps();

            $table->unique(['name', 'year']);
        });

        Schema::table('demandes', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable()->after('traite_par')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('created_by');
        });

        Schema::dropIfExists('sequences');
    }
};
