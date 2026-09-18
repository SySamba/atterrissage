<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use App\Models\DemandeDocument;
use App\Models\NatureVol;
use App\Models\Sequence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class DemandeController extends Controller
{
    // Champs complémentaires requis selon la nature du vol (code nature_vols.code)
    private const REQUIRED_DETAILS = [
        'commercial' => ['itineraire', 'heure_arrivee', 'heure_depart', 'nature_cargaison', 'affreteur', 'destinataire', 'nombre_vols', 'periode', 'representant_senegal'],
        'diplomatique' => ['proprietaire_exploitant', 'licences_equipage', 'nature_navigabilite', 'validite_navigabilite', 'reference_assurance', 'validite_assurance', 'itineraire', 'heure_arrivee', 'heure_depart', 'nature_cargaison', 'affreteur', 'destinataire', 'but_atterrissage'],
        'travail' => ['proprietaire_exploitant', 'licences_equipage', 'nature_navigabilite', 'validite_navigabilite', 'reference_assurance', 'validite_assurance', 'itineraire', 'heure_arrivee', 'heure_depart', 'affreteur', 'destinataire', 'zones_evolution'],
        'prive' => ['proprietaire_exploitant', 'licences_equipage', 'nature_navigabilite', 'validite_navigabilite', 'reference_assurance', 'validite_assurance', 'nombre_passagers', 'passagers_details', 'itineraire', 'heure_arrivee', 'heure_depart', 'affreteur', 'destinataire', 'but_atterrissage'],
    ];
    public function index(Request $request)
    {
        $query = Demande::query()
            ->with(['compagnie', 'representant', 'natureVol', 'aeroportProvenance', 'aeroportDestination', 'traitePar'])
            ->orderByDesc('created_at');

        // Un demandeur externe ne voit que ses propres demandes
        if ($request->user()->role === 'demandeur') {
            $query->where('created_by', $request->user()->id);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('demandeur_type')) {
            $query->where('demandeur_type', $request->demandeur_type);
        }

        if ($request->filled('compagnie_id')) {
            $query->where('compagnie_id', $request->compagnie_id);
        }

        if ($request->filled('date_debut')) {
            $query->whereDate('created_at', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('created_at', '<=', $request->date_fin);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('numero', 'like', '%'.$request->search.'%')
                    ->orWhere('numero_autorisation', 'like', '%'.$request->search.'%')
                    ->orWhere('immatriculation', 'like', '%'.$request->search.'%')
                    ->orWhere('demandeur_nom', 'like', '%'.$request->search.'%');
            });
        }

        $paginator = $query->paginate($request->integer('per_page', 15));
        $paginator->getCollection()->transform(fn ($d) => $d->append('demandeur_libelle'));

        return response()->json($paginator);
    }

    public function store(Request $request)
    {
        $data = $this->validateDemande($request);

        $demande = DB::transaction(function () use ($data, $request) {
            $data['numero'] = sprintf('ASA-%d-%04d', now()->year, Sequence::next('demande'));
            $data['statut'] = 'en_attente';
            $data['created_by'] = $request->user()->id;

            return Demande::create($data);
        });

        $this->storeDocuments($request, $demande);

        return response()->json($this->loadDemande($demande)->append('demandeur_libelle'), 201);
    }

    public function show(Request $request, Demande $demande)
    {
        $this->authorizeAccess($request, $demande);

        return response()->json($this->loadDemande($demande)->append('demandeur_libelle'));
    }

    public function update(Request $request, Demande $demande)
    {
        $this->authorizeAccess($request, $demande);

        if ($demande->statut !== 'en_attente' && $request->user()->role !== 'admin') {
            throw ValidationException::withMessages([
                'statut' => ['Cette demande a déjà été traitée et ne peut plus être modifiée.'],
            ]);
        }

        $demande->update($this->validateDemande($request));
        $this->storeDocuments($request, $demande);

        return response()->json($this->loadDemande($demande)->append('demandeur_libelle'));
    }

    public function traiter(Request $request, Demande $demande)
    {
        $data = $request->validate([
            'statut' => ['required', Rule::in(['autorisee', 'refusee', 'annulee'])],
            'motif_refus' => 'nullable|string|max:255',
            'montant_facture' => 'nullable|numeric|min:0',
        ]);

        $demande = DB::transaction(function () use ($request, $demande, $data) {
            // Verrouillage de la ligne : impossible de traiter deux fois la même demande
            $demande = Demande::lockForUpdate()->findOrFail($demande->id);

            if ($demande->statut !== 'en_attente') {
                throw ValidationException::withMessages([
                    'statut' => ['Cette demande a déjà été traitée (statut : '.$demande->statut.').'],
                ]);
            }

            $update = [
                'statut' => $data['statut'],
                'traite_par' => $request->user()->id,
                'date_traitement' => now(),
                'motif_refus' => $data['motif_refus'] ?? null,
            ];

            if ($data['statut'] === 'autorisee') {
                // Numérotation atomique du numéro d'autorisation + facturation
                $update['numero_autorisation'] = sprintf('AUT-%d-%04d', now()->year, Sequence::next('autorisation'));
                $update['montant_facture'] = $data['montant_facture'] ?? $this->calculerFacture($demande);
            }

            $demande->update($update);

            return $demande;
        });

        return response()->json($this->loadDemande($demande)->append('demandeur_libelle'));
    }

    public function destroy(Request $request, Demande $demande)
    {
        $this->authorizeAccess($request, $demande);

        if ($request->user()->role === 'demandeur' && $demande->statut !== 'en_attente') {
            return response()->json(['message' => 'Une demande traitée ne peut pas être supprimée.'], 422);
        }

        $demande->delete();

        return response()->json(['message' => 'Demande supprimée']);
    }

    private function authorizeAccess(Request $request, Demande $demande): void
    {
        if ($request->user()->role === 'demandeur' && $demande->created_by !== $request->user()->id) {
            abort(403, 'Accès non autorisé.');
        }
    }

    private function validateDemande(Request $request): array
    {
        $code = $request->nature_vol_id ? NatureVol::find($request->nature_vol_id)?->code : null;

        $rules = [
            'type' => ['required', Rule::in(Demande::TYPES)],
            'demandeur_type' => ['required', Rule::in(Demande::DEMANDEUR_TYPES)],
            'compagnie_id' => 'required_if:demandeur_type,compagnie|nullable|exists:compagnies,id',
            'representant_id' => 'required_if:demandeur_type,representant_diplomatique|nullable|exists:representant_agrees,id',
            'demandeur_nom' => 'required_if:demandeur_type,operateur|nullable|string|max:255',
            'objet' => 'nullable|string',
            'numero_vol' => 'nullable|string|max:50',
            'nature_vol_id' => 'nullable|exists:nature_vols,id',
            'immatriculation' => 'nullable|string|max:20',
            'type_aeronef' => 'nullable|string|max:255',
            'aeroport_provenance_id' => 'nullable|exists:aeroports,id',
            'aeroport_destination_id' => 'nullable|exists:aeroports,id',
            'date_vol' => 'nullable|date',
            'poids_fret' => 'nullable|numeric|min:0',
            'observations' => 'nullable|string',
            'details' => 'nullable|array',
            'documents' => 'nullable|array',
            'documents.*' => 'nullable|array',
            'documents.*.*' => 'file|max:10240|mimes:pdf,jpg,jpeg,png,doc,docx',
        ];

        // Champs complémentaires : liste blanche + requis selon la nature du vol
        foreach (array_keys(Demande::DETAIL_LABELS) as $key) {
            $rules["details.$key"] = 'nullable|string';
        }
        foreach (self::REQUIRED_DETAILS[$code] ?? [] as $key) {
            $rules["details.$key"] = 'required|string';
        }

        // Les 4 natures exigent le type et l'immatriculation de l'aéronef
        if ($code) {
            $rules['immatriculation'] = 'required|string|max:20';
            $rules['type_aeronef'] = 'required|string|max:255';
            $rules['aeroport_provenance_id'] = 'required|exists:aeroports,id';
            $rules['aeroport_destination_id'] = 'required|exists:aeroports,id';
            $rules['date_vol'] = 'required|date';
        }
        if (in_array($code, ['diplomatique', 'travail', 'prive'], true)) {
            $rules['numero_vol'] = 'required|string|max:50';
            $rules['objet'] = 'required|string';
        }

        return $request->validate($rules);
    }

    /**
     * Enregistre les pièces jointes envoyées (documents[champ][]).
     */
    private function storeDocuments(Request $request, Demande $demande): void
    {
        foreach ($request->file('documents', []) as $champ => $files) {
            if (! array_key_exists($champ, Demande::DOC_LABELS)) {
                continue;
            }
            foreach ((array) $files as $file) {
                if (! $file) {
                    continue;
                }
                $demande->documents()->create([
                    'champ' => $champ,
                    'nom_original' => $file->getClientOriginalName(),
                    'chemin' => $file->store("demandes/{$demande->id}"),
                ]);
            }
        }
    }

    /**
     * Téléchargement d'une pièce jointe (demandeur propriétaire ou interne).
     */
    public function document(Request $request, Demande $demande, DemandeDocument $document)
    {
        $this->authorizeAccess($request, $demande);
        abort_if($document->demande_id !== $demande->id, 404);

        return Storage::download($document->chemin, $document->nom_original);
    }

    /**
     * Suppression d'une pièce jointe (demande encore en attente, ou admin).
     */
    public function destroyDocument(Request $request, Demande $demande, DemandeDocument $document)
    {
        $this->authorizeAccess($request, $demande);
        abort_if($document->demande_id !== $demande->id, 404);

        if ($demande->statut !== 'en_attente' && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Impossible de supprimer une pièce d\'une demande traitée.'], 422);
        }

        Storage::delete($document->chemin);
        $document->delete();

        return response()->json(['message' => 'Document supprimé']);
    }

    /**
     * Fiche PDF de la demande : toutes les informations envoyées par l'exploitant.
     */
    public function pdf(Request $request, Demande $demande)
    {
        $this->authorizeAccess($request, $demande);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('exports.demande', [
            'demande' => $this->loadDemande($demande),
            'parametre' => \App\Models\Parametre::instance(),
            'genereLe' => now()->format('d/m/Y H:i'),
        ])->setPaper('a4');

        return $pdf->download($demande->numero.'.pdf');
    }

    /**
     * Facture PDF relative à l'autorisation (uniquement si la demande est autorisée).
     */
    public function facture(Request $request, Demande $demande)
    {
        $this->authorizeAccess($request, $demande);

        if ($demande->statut !== 'autorisee') {
            return response()->json(['message' => 'Aucune facture : la demande n\'est pas autorisée.'], 422);
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('exports.facture', [
            'demande' => $this->loadDemande($demande),
            'parametre' => \App\Models\Parametre::instance(),
            'genereLe' => now()->format('d/m/Y'),
        ])->setPaper('a4');

        return $pdf->download('facture_'.$demande->numero.'.pdf');
    }

    private function calculerFacture(Demande $demande): float
    {
        // Redevance forfaitaire selon le type d'autorisation (paramétrable) + fret
        $p = \App\Models\Parametre::instance();

        $forfait = match ($demande->type) {
            'survol' => (float) $p->tarif_survol,
            'atterrissage' => (float) $p->tarif_atterrissage,
            default => (float) $p->tarif_survol_atterrissage,
        };

        return $forfait + ((float) $demande->poids_fret * 50);
    }

    private function loadDemande(Demande $demande): Demande
    {
        return $demande->load(['compagnie', 'representant', 'natureVol', 'aeroportProvenance', 'aeroportDestination', 'traitePar', 'documents']);
    }
}
