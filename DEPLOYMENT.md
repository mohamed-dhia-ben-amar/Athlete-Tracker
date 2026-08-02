# Deployment Guide

Guide complet pour déployer Athlete Tracker en production.

## Prérequis

- Compte Supabase configuré avec la base de données
- Projet Node.js buildé avec succès
- Variables d'environnement prêtes

## Variables d'environnement

Créer un fichier `.env.production` avec:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Analytics (optionnel)
VITE_ANALYTICS_ID=your-analytics-id

# Environment
VITE_ENV=production
```

## Vercel (Recommandé)

### 1. Pousser le code sur GitHub

```bash
git remote add origin https://github.com/your-username/athlete-tracker.git
git push -u origin main
```

### 2. Créer le projet Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer "New Project"
3. Importer le repository GitHub
4. Vercel détecte automatiquement Vite

### 3. Configurer les variables d'environnement

Dans Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key
```

### 4. Déployer

```bash
vercel deploy --prod
```

Vercel va:
- Détecter Vite automatiquement
- Exécuter `npm run build`
- Déployer sur une URL globale avec CDN

### Avantages
- Déploiement gratuit (Hobby plan)
- SSL/HTTPS automatique
- Analytics intégrés
- Preview deployments pour les PRs

## Netlify

### 1. Connecter le repository

1. Aller sur [netlify.com](https://netlify.com)
2. Cliquer "New site from Git"
3. Sélectionner GitHub et le repository
4. Netlify configure automatiquement Vite

### 2. Configurer les variables

Dans Site settings → Build & deploy → Environment:

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key
```

### 3. Paramètres de build

Build command: `npm run build`
Publish directory: `dist`

### 4. Déployer

Pousser vers main:
```bash
git push origin main
```

Netlify va automatiquement builder et déployer.

## Docker

### 1. Créer Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copier les dépendances
COPY package*.json ./
RUN npm ci

# Copier le code
COPY . .

# Builder
RUN npm run build

# Servir avec static server
RUN npm install -g serve
EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

### 2. Créer .dockerignore

```
node_modules
npm-debug.log
dist
.git
.gitignore
README.md
.env
.env.local
```

### 3. Builder et exécuter localement

```bash
docker build -t athlete-tracker .
docker run -p 3000:3000 athlete-tracker
```

### 4. Pousser sur registre

```bash
# Docker Hub
docker tag athlete-tracker:latest your-username/athlete-tracker:latest
docker push your-username/athlete-tracker:latest

# GitHub Container Registry
docker tag athlete-tracker:latest ghcr.io/your-username/athlete-tracker:latest
docker login ghcr.io
docker push ghcr.io/your-username/athlete-tracker:latest
```

### 5. Déployer sur AWS ECS, GCP Cloud Run, etc.

Voir la documentation spécifique de chaque plateforme.

## Railway.app

### 1. Connecter le repository

1. Aller sur [railway.app](https://railway.app)
2. Cliquer "New Project"
3. "Deploy from GitHub"
4. Sélectionner le repository

### 2. Configurer les variables

Dans Project → Variables:

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key
```

### 3. Configuration

Railway détecte Vite automatiquement.

## Heroku

### 1. Installer Heroku CLI

```bash
npm install -g heroku
heroku login
```

### 2. Créer l'app

```bash
heroku create my-athlete-tracker
```

### 3. Configurer les variables

```bash
heroku config:set VITE_SUPABASE_URL=https://your-project.supabase.co
heroku config:set VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Créer Procfile

```
web: npm run build && npm start
```

Ajouter script start dans package.json:
```json
"start": "serve -s dist -l 5000"
```

### 5. Déployer

```bash
git push heroku main
```

## AWS S3 + CloudFront

### 1. Builder

```bash
npm run build
```

### 2. Créer bucket S3

```bash
aws s3 mb s3://athlete-tracker-prod
```

### 3. Uploader

```bash
aws s3 sync dist/ s3://athlete-tracker-prod --delete
```

### 4. Configurer CloudFront

- Créer distribution CloudFront
- Pointer vers S3 bucket
- Configurer SSL/HTTPS
- Point d'invalidation: `/*`

### 5. Automatiser avec GitHub Actions

Créer `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: aws s3 sync dist/ s3://athlete-tracker-prod --delete
      - run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/*"
```

## Configuration Supabase pour production

### 1. RLS (Row Level Security)

Vérifier que les policies sont en place:

```sql
-- Vérifier les policies
SELECT * FROM pg_policies WHERE tablename = 'competition_records';
```

### 2. Database backups

Dans Supabase Dashboard → Backups:
- Activer les backups automatiques
- Fréquence: Quotidienne recommandée
- Rétention: 30 jours

### 3. Auth

- Vérifier les provider OAuth si utilisé
- Configurer les URLs autorisées dans Auth
- Activer CAPTCHA si needed

### 4. Monitoring

- Activer les logs de performance
- Configurer les alertes
- Vérifier les quotas

## Monitoring en production

### Sentry (Error Tracking)

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
```

### Google Analytics

```typescript
import { useEffect } from 'react'

export function useGoogleAnalytics() {
  useEffect(() => {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_ID}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    window.gtag = function() { window.dataLayer.push(arguments) }
    window.gtag('js', new Date())
    window.gtag('config', import.meta.env.VITE_GA_ID)
  }, [])
}
```

## Checklist de production

- [ ] Variables d'environnement configurées
- [ ] Build en production testé
- [ ] ESLint et types passés
- [ ] Tests manuels complets
- [ ] Supabase RLS vérifiées
- [ ] Backups configurés
- [ ] SSL/HTTPS activé
- [ ] Error tracking configuré
- [ ] Analytics intégrés
- [ ] Performance monitored (Lighthouse)
- [ ] Monitoring alertes configurées
- [ ] Plan de rollback défini

## Troubleshooting

### "Cannot find module 'express'"
Variables d'environnement non trouvées. Vérifier le format `VITE_*`.

### Erreur CORS Supabase
Ajouter le domaine dans Supabase Auth → URL Configuration.

### Export fail en production
Vérifier que les exports libs sont présentes (npm install).

### Performance lente
- Vérifier l'onglet Network dans DevTools
- Activer la compression gzip
- Vérifier les chunks Vite (build/metrics)

## Support

- Documentation Supabase: https://supabase.com/docs
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html
- Issues: https://github.com/your-username/athlete-tracker/issues
