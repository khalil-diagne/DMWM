# Dahiratoul Moustarchidina Wal Moustarchidaty

Site communautaire du dahira : annonces des événements (ziarras, causeries, récitals), carte interactive Leaflet/OpenStreetMap, partage WhatsApp, et espace privé de gestion avec authentification sécurisée.

## Stack technique

| Composant     | Choix                                            |
|---------------|--------------------------------------------------|
| Frontend      | React 19 + Vite + Tailwind CSS 4 + Leaflet       |
| Backend / API | Vercel API Routes (fonctions serverless Node.js) |
| Base de données | Neon (Postgres serverless)                     |
| Authentification | JWT (jose) dans un cookie httpOnly, mot de passe hashé bcrypt, rôles admin/secrétaire |
| Carte         | Leaflet + OpenStreetMap                          |
| Hébergement   | Vercel (frontend + API dans le même projet)      |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Vercel                                                 │
│  ┌──────────────┐      ┌────────────────────────────┐   │
│  │ Frontend     │ ───▶ │ API Routes (serverless)    │   │
│  │ React (SPA)  │  /api │ Node.js                   │   │
│  └──────────────┘      │  auth / events / users     │   │
│                        └────────────┬───────────────┘   │
└─────────────────────────────────────┼───────────────────┘
                                      │ DATABASE_URL (encrypted)
                            ┌─────────┴─────────┐
                            │  Neon Postgres     │
                            │  users, events     │
                            └───────────────────┘
```

### Structure du projet

```
├── api/                  # Vercel API Routes
│   ├── auth/             # POST login · POST logout · GET me
│   ├── events/           # GET/POST liste · GET/PUT/DELETE détail
│   ├── users/            # GET/POST liste · DELETE détail (admin)
│   └── reset.ts          # Réinitialise les événements de démo
├── server/
│   ├── db.ts             # Pool Neon + requêtes SQL
│   ├── auth.ts           # JWT, cookies httpOnly, bcrypt, gardes de rôle
│   ├── http.ts           # Helpers JSON / lecture du corps
│   ├── schema.sql        # Schéma des tables users et events
│   ├── seed.ts           # Événements de démonstration
│   └── dev.ts            # Serveur API local (port 8787)
├── scripts/
│   ├── setup-db.ts       # Applique le schéma
│   └── seed.ts           # Crée l'admin + les événements de démo
├── src/                  # Frontend React
│   ├── pages/            # Home, Events, EventDetail, MapPage, About, Contact, Admin, AdminLogin
│   ├── components/       # Layout, EventCard, Map, ProtectedRoute
│   ├── store.tsx         # État des événements (fetch API)
│   ├── auth.tsx          # État de connexion (fetch API)
│   └── api.ts            # Client fetch vers /api
├── vercel.json           # Configuration de déploiement Vercel
└── .env.example          # Variables d'environnement à copier
```

### Rôles et permissions

| Rôle       | Événements (CRUD) | Gestion des comptes |
|------------|-------------------|---------------------|
| Admin      | ✅                | ✅                  |
| Secrétaire | ✅                | ❌                  |
| Visiteur   | Lecture seule     | ❌                  |

L'authentification repose sur un **JWT stocké dans un cookie httpOnly** (protection XSS). Les mots de passe sont hashés avec **bcrypt**. Les routes protégées vérifient le rôle côté serveur via des gardes (`requireRole`).

## Développement local

Prérequis : Node.js 20+, un projet Neon avec une chaîne de connexion.

```bash
# 1. Copier les variables d'environnement
cp .env.example .env
#    → renseigner DATABASE_URL et JWT_SECRET

# 2. Installer les dépendances
npm install

# 3. Créer les tables et le compte admin + données de démo
npm run db:setup
npm run db:seed

# 4. Lancer l'API locale (http://localhost:8787)
npm run dev:api

# 5. Lancer le frontend (http://localhost:5173, proxy /api → 8787)
npm run dev
```

### Compte admin par défaut

```
Email : admin@dahira.sn
Mot de passe : dahira-admin-2026
```

> ⚠️ Modifiez ces valeurs dans `.env` (variables `ADMIN_EMAIL` / `ADMIN_PASSWORD`) avant de déployer en production.

## Déploiement sur Vercel

### 1. Créer la base de données Neon

1. Créez un projet sur [neon.tech](https://neon.tech) (plan gratuit suffisant).
2. Copiez la **chaîne de connexion** (`postgresql://...?sslmode=require`).

### 2. Importer le projet dans Vercel

Le plus simple : utilisez le **Marketplace Vercel** pour connecter Neon, ou ajoutez la variable manuellement.

Option A — Marketplace (recommandé) :
- Dans Vercel → *Storage* → **Create → Neon Postgres**, puis connectez-la à votre projet. Vercel définit `DATABASE_URL` automatiquement.

Option B — Variable manuelle :
- Dans Vercel → *Settings* → *Environment Variables*, ajoutez :

```
DATABASE_URL = postgresql://...
JWT_SECRET    = une-longue-chaine-aleatoire
```

### 3. Déployer

```bash
npm i -g vercel
vercel login
vercel        # preview
vercel --prod # production
```

Ou connectez simplement le dépôt GitHub dans Vercel — le `vercel.json` configure automatiquement la commande de build (`npm run build`), le dossier de sortie (`dist`) et les règles de routage SPA. Les API Routes dans `api/` sont détectées automatiquement.

### 4. Après le premier déploiement

La table `events` est vide. Deux options pour l'initialiser :

```bash
# En local, pointer vers la base de production :
DATABASE_URL=<url-production> npm run db:setup
DATABASE_URL=<url-production> npm run db:seed
```

Ou, une fois connecté dans l'espace privé, cliquez sur **« Réinitialiser les données »** dans le tableau de bord : cela supprime les événements et réinsère les 5 événements de démonstration.


Avant d’utiliser le suivi des présences, l’historique, les messages de contact ou les comptes rendus sur une base déjà déployée, relancez `npm run db:setup` avec `DATABASE_URL` pointant vers cette base. Le schéma est idempotent et ajoute les tables/colonnes nécessaires sans supprimer les événements existants.

## Utilisation

- **Public** : accueil avec compte à rebours du prochain événement, liste filtrable des événements, carte interactive, pages « Le Dahira » et « Contact ».
- **Connexion** : bouton « Se connecter » dans la barre de navigation → page de connexion (email + mot de passe).
- **Espace privé** (`/espace-prive-d8a9x`) : tableau de bord protégé.
  - **Événements** : ajout, suppression, réinitialisation.
  - **Présences** : pour chaque événement, ajouter, rechercher, modifier, supprimer et imprimer les noms des participants ; l’accès est réservé aux secrétaires et administrateurs.\n  - **Suivi** : statistiques de participation, historique des changements, comptes rendus par événement et, pour les administrateurs, messages reçus via le formulaire de contact.\n- **Rappels** : chaque fiche événement propose un message WhatsApp prérempli à envoyer manuellement.
  - **Comptes** (admin uniquement) : créer des comptes secrétaires ou admins, supprimer des comptes.
- **Carte** : chaque événement est géolocalisé ; itinéraire Google Maps et partage WhatsApp disponibles sur chaque fiche.
