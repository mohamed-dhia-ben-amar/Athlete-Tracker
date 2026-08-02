# Athlete Tracker 🏅

Une application web moderne de gestion de compétitions d'athlètes avec authentification, CRUD complet, recherche, filtrage et export de données.

## 🎯 Caractéristiques

- **Authentification Supabase** - Login/Logout sécurisé avec gestion de session
- **Gestion des compétitions** - Créer, lire, mettre à jour, supprimer des compétitions
- **Tableau de bord** - Vue d'ensemble avec statistiques en temps réel
- **Recherche & Filtrage** - Recherche multi-champs et 3 filtres indépendants
- **Pagination & Tri** - Table interactive avec pagination flexible et tri par colonne
- **Export de données** - Exporter en Excel (XLSX) et PDF avec mise en forme
- **Animations fluides** - Transitions Framer Motion pour meilleure UX
- **Notifications visuelles** - Toast animés pour success/error/info
- **Dark mode** - Support complet du thème clair/sombre
- **Accessibilité** - ARIA labels, navigation au clavier, focus management
- **Optimisations** - Lazy loading des exports, code-splitting automatique

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ et npm
- Compte Supabase avec base de données PostgreSQL
- Clé API Supabase (anon public + service role secret)

### Installation

```bash
# Cloner le repository
git clone <repo-url>
cd "Athlete Tracker"

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase
```

### Configuration Supabase

1. Créer une nouvelle organisation et projet
2. Copier l'URL du projet et les clés (anon et service role)
3. Dans le SQL Editor, exécuter:

```sql
-- Table de compétitions avec RLS
CREATE TABLE competition_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_type TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  sport_type TEXT NOT NULL,
  discipline TEXT NOT NULL,
  competition_name TEXT NOT NULL,
  competition_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  stage TEXT NOT NULL,
  status TEXT NOT NULL,
  result TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Politique Row Level Security
ALTER TABLE competition_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own records" ON competition_records
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create their own records" ON competition_records
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own records" ON competition_records
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own records" ON competition_records
  FOR DELETE USING (created_by = auth.uid());
```

### Démarrage du serveur de développement

```bash
npm run dev
```

L'application s'ouvre sur `http://localhost:5173`

### Build pour production

```bash
npm run build
npm run preview
```

## 📁 Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── Modal.tsx       # Boîte de dialogue avec animations
│   ├── ConfirmDialog.tsx # Dialogue de confirmation
│   ├── Toast.tsx       # Notifications animées
│   ├── Spinner.tsx     # Indicateur de chargement
│   └── Skeleton.tsx    # Skeleton loaders
├── features/           # Fonctionnalités métier
│   ├── auth/           # Authentification (login/logout/useAuth)
│   ├── dashboard/      # Tableau de bord et table de compétitions
│   ├── layout/         # Layout principal (AppShell, Sidebar, Header)
│   └── competitions/   # Gestion complète des compétitions
├── services/           # Couche d'accès aux données
│   └── competitionService.ts  # Opérations CRUD Supabase
├── lib/                # Utilitaires
│   ├── supabase.ts    # Configuration client Supabase
│   └── exportUtils.ts # Export Excel/PDF (lazy loaded)
├── types/              # Types TypeScript
│   └── competition.ts  # Interfaces de compétition
└── main.tsx           # Point d'entrée React
```

## 🔑 API Principales

### Service de compétitions

```typescript
// Récupérer toutes les compétitions de l'utilisateur
fetchCompetitions(): Promise<CompetitionRecord[]>

// Créer une nouvelle compétition
createCompetition(payload: CompetitionRecordInsert): Promise<CompetitionRecord>

// Mettre à jour une compétition
updateCompetition(payload: CompetitionRecordInsert & { id: string }): Promise<CompetitionRecord>

// Supprimer une compétition
deleteCompetition(id: string): Promise<void>
```

### Export de données

```typescript
// Exporter les compétitions en Excel (XLSX)
exportCompetitionsToExcel(records: CompetitionRecord[]): void

// Exporter les compétitions en PDF
exportCompetitionsToPdf(records: CompetitionRecord[]): void
```

## 🎨 Composants clés

### Modal & ConfirmDialog
- Animations fluides avec Framer Motion
- Navigation au clavier (ESC pour fermer)
- Focus management automatique
- ARIA labels pour accessibilité

### Toast (Notifications)
- Auto-dismiss après 4 secondes
- Types: success, error, info
- Pile de notifications gérée automatiquement
- Animations d'entrée/sortie

### CompetitionTable
- Tri par colonne (clic sur l'en-tête)
- Pagination avec sélection de taille
- Actions inline (éditer/supprimer)
- Skeleton loading state

## 🔐 Sécurité

- **Row Level Security (RLS)** - Chaque utilisateur ne voit que ses données
- **Authentification Supabase** - Gestion sécurisée des sessions
- **Variables d'environnement** - Clés API jamais commitées
- **Validation des formulaires** - Zod pour validation côté client et serveur

## 🚀 Déploiement

### Vercel (recommandé)

```bash
vercel deploy
```

Configurer les variables d'environnement dans Vercel Dashboard.

### Netlify

```bash
npm run build
# Déployer le dossier 'dist/'
```

### Docker

```bash
docker build -t athlete-tracker .
docker run -p 3000:3000 athlete-tracker
```

## 📊 Technologies utilisées

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build**: Vite 5.4, ESLint
- **Gestion d'état**: React Query v4.34
- **Formulaires**: React Hook Form + Zod
- **Table**: TanStack React Table v8.21
- **Animations**: Framer Motion v10.12
- **Export**: XLSX, jsPDF
- **Backend**: Supabase (PostgreSQL + Auth)
- **Routing**: React Router v6.20
- **UI Icons**: lucide-react

## 📈 Performance

- Bundle size initial: ~150 KB (gzip)
- Export libs lazy-loaded: Code-split automatique
- Skeleton loaders: Meilleure perception de la performance
- React Query caching: Moins de requêtes réseau

## ♿ Accessibilité

- WCAG 2.1 AA compliant
- ARIA labels sur tous les contrôles interactifs
- Navigation au clavier complète
- Contraste de couleurs conforme
- Focus visible sur tous les éléments

## 🐛 Troubleshooting

### Erreur: "Invalid Supabase credentials"
- Vérifier les variables dans `.env.local`
- S'assurer que les clés sont correctes dans Supabase Dashboard

### Export PDF vide
- Vérifier la console pour erreurs
- Les exports nécessitent des données valides

### Pas de données affichées
- Vérifier les RLS policies dans Supabase
- S'assurer que l'utilisateur est authentifié

## 📝 Licence

MIT

## 👨‍💻 Auteur

Développé avec ❤️ pour la gestion de compétitions d'athlètes
