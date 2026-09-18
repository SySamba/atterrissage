# ADAC — Autorisations de survol et d'atterrissage

Système de gestion des demandes d'autorisation de survol et d'atterrissage de
l'**Autorité de l'Aviation Civile — République du Tchad** :

- Dépôt des demandes par les exploitants (formulaire adapté aux 4 natures de vol + pièces jointes)
- Traitement par le bureau survol : autorisation `AUT-AAAA-NNNN`, refus, annulation
- Facturation (tarifs paramétrables + fret)
- Tableau de bord statistique (KPI, filtres, états exportables CSV/PDF)

## Architecture

- `backend/` — API REST **Laravel** (PHP 8.2, MySQL `gestion_atterrissage`, auth Sanctum par token)
- `frontend/` — SPA **React** (Vite, Tailwind CSS v4, react-router, axios). Le dev server proxifie `/api` → `127.0.0.1:8000`

## Démarrage

```bash
# Base MySQL (XAMPP) : créer la base si besoin
mysql -u root -e "CREATE DATABASE IF NOT EXISTS gestion_atterrissage CHARACTER SET utf8mb4;"

# Backend
cd backend
composer install
php artisan migrate --seed   # données de démonstration
php artisan serve --port=8000

# Frontend (autre terminal)
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

## Comptes de démonstration

| Rôle      | Email                    | Mot de passe |
|-----------|--------------------------|--------------|
| Admin     | admin@adac.td            | password     |
| Agent     | agent@adac.td            | password     |
| Demandeur | demandeur@toumai-air.td  | password     |

Le demandeur peut aussi **s'inscrire lui-même** via « Créer un compte » sur la page de connexion.

## Rôles et permissions

- **admin** : accès complet, gestion des comptes utilisateurs
- **agent** : référentiels, traitement des demandes ASA, tableau de bord et exports (pas de gestion des utilisateurs)
- **demandeur** : dépôt et suivi de ses propres demandes uniquement

## Sécurité et intégrité

- Middleware `role:` (admin/agent/demandeur) appliqué sur les routes ; le demandeur est restreint à ses demandes (`created_by`)
- Numérotation atomique des demandes et autorisations via la table `sequences` (verrou `FOR UPDATE`)
- Une demande traitée est verrouillée : impossible de la re-traiter ou de la modifier (sauf admin)
- Validation serveur : `required_if` selon le type de demandeur, PAX redevance uniquement au départ de l'aéroport de référence
- Pagination sur les listes vols et demandes (`?page=&per_page=`)

## Exports

Les états sont exportables depuis le **tableau de bord** (onglets « États détaillés ») :

- **CSV** (compatible Excel, UTF-8 BOM, séparateur `;`) : `GET /api/stats/export/{type}?format=csv`
- **PDF** (DomPDF, en-tête exploitant) : `GET /api/stats/export/{type}?format=pdf`

Types exportables : `trafic-compagnies`, `trafic-provenance`, `trafic-destination`, `taux-remplissage`, `repartition-compagnies`, `factures`, `aeronefs-aeroport`.

## Fonctionnalités

### Module ASA
- **Inscription publique** des exploitants (`/register` → compte demandeur) — aucun compte interne requis
- Dépôt de demandes (survol / atterrissage / les deux) avec informations de l'avion (immatriculation, type)
- Numérotation automatique `ASA-AAAA-NNNN`, traitement → autorisation `AUT-AAAA-NNNN`
- **Facture** calculée selon les tarifs paramétrables (survol 200 000 / atterrissage 200 000 / survol+atterrissage 300 000 FCFA par défaut + 50 FCFA/kg de fret)
- **Fiche PDF** de la demande (`GET /api/demandes/{id}/pdf`) et **facture PDF** (`GET /api/demandes/{id}/facture`)
- États : demandes par statut/période, par demandeur, par provenance/destination, facturation totale
- Référentiels : représentants agréés, natures de vol

### Champs par nature de vol
Le formulaire affiche les éléments exigés par les documents ADAC selon la nature choisie :
- **Commercial non régulier** : itinéraire, heures, cargaison, affréteur/destinataire, nb de vols, période, partenaires, hébergement, représentant au Tchad + documents compagnie et aéronef
- **Diplomatique** : n° vol, propriétaire/exploitant, navigabilité, assurance, licences équipage, itinéraire, cargaison, but de l'atterrissage
- **Travail aérien** : idem + zones d'évolution, équipements, autres autorisations + lettre d'introduction, avis des ministres, certificat de travail aérien
- **Privé** : idem + nombre et identité des passagers, équipements à bord

### Administration
- Paramètres exploitant (nom, service, contacts, source des données, aéroport de référence)
- Gestion des utilisateurs (admin / agent interne / demandeur externe)
