<?php

use App\Http\Controllers\Api\AeronefController;
use App\Http\Controllers\Api\AeroportController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompagnieController;
use App\Http\Controllers\Api\DemandeController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\NatureVolController;
use App\Http\Controllers\Api\ParametreController;
use App\Http\Controllers\Api\RepresentantAgreeController;
use App\Http\Controllers\Api\StatistiqueController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VolController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me/password', [AuthController::class, 'changePassword']);

    // Référentiels en lecture : tous les utilisateurs connectés
    // (le demandeur en a besoin pour saisir sa demande)
    Route::apiResource('aeroports', AeroportController::class)->only(['index', 'show']);
    Route::apiResource('compagnies', CompagnieController::class)->only(['index', 'show']);
    Route::apiResource('aeronefs', AeronefController::class)->only(['index', 'show']);
    Route::apiResource('nature-vols', NatureVolController::class)->only(['index']);
    Route::apiResource('representants', RepresentantAgreeController::class)
        ->parameters(['representants' => 'representantAgree'])
        ->only(['index', 'show']);

    // ASA : demandes accessibles à tous les rôles
    // (le contrôleur restreint le demandeur à ses propres demandes)
    Route::apiResource('demandes', DemandeController::class);
    Route::get('demandes/{demande}/pdf', [DemandeController::class, 'pdf']);
    Route::get('demandes/{demande}/facture', [DemandeController::class, 'facture']);
    Route::get('demandes/{demande}/documents/{document}', [DemandeController::class, 'document']);
    Route::delete('demandes/{demande}/documents/{document}', [DemandeController::class, 'destroyDocument']);

    // Écriture : admin + agent (personnel interne)
    Route::middleware('role:admin,agent')->group(function () {
        Route::apiResource('aeroports', AeroportController::class)->except(['index', 'show']);
        Route::apiResource('compagnies', CompagnieController::class)->except(['index', 'show']);
        Route::apiResource('aeronefs', AeronefController::class)->except(['index', 'show']);
        Route::apiResource('nature-vols', NatureVolController::class)->except(['index', 'show']);
        Route::apiResource('representants', RepresentantAgreeController::class)
            ->parameters(['representants' => 'representantAgree'])
            ->except(['index', 'show']);

        // GESTAT : vols et escales
        Route::apiResource('vols', VolController::class);

        // Traitement des demandes par le bureau survol
        Route::post('demandes/{demande}/traiter', [DemandeController::class, 'traiter']);

        // Paramétrage
        Route::get('parametres', [ParametreController::class, 'show']);
        Route::put('parametres', [ParametreController::class, 'update']);

        // États statistiques et exports
        Route::get('stats/dashboard', [StatistiqueController::class, 'dashboard']);
        Route::get('stats/trafic-compagnies', [StatistiqueController::class, 'traficParCompagnie']);
        Route::get('stats/trafic-sens', [StatistiqueController::class, 'traficParSens']);
        Route::get('stats/trafic-provenance', [StatistiqueController::class, 'traficParProvenance']);
        Route::get('stats/trafic-destination', [StatistiqueController::class, 'traficParDestination']);
        Route::get('stats/taux-remplissage', [StatistiqueController::class, 'tauxRemplissage']);
        Route::get('stats/repartition-compagnies', [StatistiqueController::class, 'repartitionCompagnies']);
        Route::get('stats/factures', [StatistiqueController::class, 'factures']);
        Route::get('stats/aeronefs-aeroport', [StatistiqueController::class, 'aeronefsParAeroport']);
        Route::get('stats/demandes', [StatistiqueController::class, 'statistiquesDemandes']);
        Route::match(['get', 'post'], 'stats/export-dashboard', [ExportController::class, 'dashboard']);
        Route::get('stats/export/{type}', [ExportController::class, 'export']);
    });

    // Administration des comptes : admin uniquement
    Route::apiResource('users', UserController::class)
        ->except(['show'])
        ->middleware('role:admin');
});
