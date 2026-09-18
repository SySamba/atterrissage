#!/usr/bin/env bash
# Build le frontend React et l'intègre dans backend/public pour Hostinger.
# Après exécution : uploadez le dossier backend/ et pointez le domaine
# atterrissage-statistique.sambasy.com sur backend/public.
set -e
cd "$(dirname "$0")/frontend"
npm run build
rm -rf ../backend/public/assets
cp -R dist/. ../backend/public/
echo "OK — frontend intégré dans backend/public. Uploadez le dossier backend/ sur Hostinger."
