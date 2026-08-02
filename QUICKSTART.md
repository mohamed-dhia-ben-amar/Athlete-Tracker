# Quick Start Guide

5 minutes pour démarrer avec Athlete Tracker!

## Step 1: Configuration Supabase (2 min)

1. Aller sur [supabase.com](https://supabase.com) → Sign Up
2. Créer une nouvelle organisation
3. Créer un nouveau projet (région Europe recommandée)
4. Attendre 1-2 minutes que la DB soit créée
5. Copier l'**URL du projet** et la **clé anon** depuis Settings → API

## Step 2: Initialiser la base de données (1 min)

Dans Supabase Dashboard → SQL Editor → New Query, exécuter:

```sql
-- Créer la table
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

-- Activer RLS
ALTER TABLE competition_records ENABLE ROW LEVEL SECURITY;

-- Ajouter les politiques de sécurité
CREATE POLICY "Users can view their own records" ON competition_records
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create their own records" ON competition_records
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own records" ON competition_records
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own records" ON competition_records
  FOR DELETE USING (created_by = auth.uid());
```

Cliquer sur "Run" ✓

## Step 3: Installer localement (2 min)

```bash
# Clone le repository
git clone https://github.com/your-username/athlete-tracker.git
cd "Athlete Tracker"

# Installer les packages
npm install
```

## Step 4: Configurer les variables (30 sec)

Créer `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Remplacer avec vos valeurs de Supabase.

## Step 5: Lancer! (1 min)

```bash
npm run dev
```

Ouvrir `http://localhost:5173` 🚀

## Premiers pas dans l'app

### 1️⃣ Se connecter
- Cliquer "Se connecter" en haut à droite
- Créer un compte (email + mot de passe)
- Confirmer l'email (Supabase envoie un lien)
- Se reconnecter

### 2️⃣ Créer une compétition
- Cliquer "Nouvelle compétition"
- Remplir le formulaire
- Cliquer "Créer la compétition"

### 3️⃣ Gérer vos compétitions
- Voir la liste dans le tableau
- **Filtrer**: Statut, Étape, Sport (colonnes de droite)
- **Chercher**: Par nom, compétition, discipline, lieu
- **Éditer**: Clic sur une ligne → Modifier
- **Supprimer**: Clic sur une ligne → Supprimer
- **Trier**: Clic sur l'en-tête de colonne

### 4️⃣ Exporter vos données
- Cliquer "Exporter Excel" → Fichier XLSX
- Cliquer "Exporter PDF" → Fichier PDF

## Fonctionnalités

✅ Authentification sécurisée  
✅ Créer/Lire/Mettre à jour/Supprimer compétitions  
✅ Recherche multi-champs  
✅ 3 filtres indépendants  
✅ Pagination flexible  
✅ Tri par colonne  
✅ Export Excel/PDF  
✅ Dark mode  
✅ Responsive design  
✅ Accessibilité (WCAG 2.1 AA)  

## Build pour production

```bash
npm run build
```

Cela crée un dossier `dist/` optimisé. Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour les options de déploiement.

## Besoin d'aide?

- 📖 Voir [DOCUMENTATION.md](./DOCUMENTATION.md) pour details techniques
- 🔧 Voir [API.md](./API.md) pour documentation des services
- 🚀 Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour déployer en production
- 👨‍💻 Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour contribuer au projet
- 🐛 [Ouvrir une issue](https://github.com/your-username/athlete-tracker/issues)

## Prochaines étapes

- Ajouter plus de compétitions pour tester les filtres
- Exporter vos données en Excel/PDF
- Partager l'app avec d'autres utilisateurs
- Déployer en production (Vercel, Netlify, etc.)
- Contribuer au projet! 

Bon sport! ⚡
