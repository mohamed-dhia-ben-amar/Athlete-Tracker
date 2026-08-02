# Contributing Guide

Merci de votre intérêt pour contribuer à Athlete Tracker! Ce guide explique comment débuter.

## Code de conduite

Être respectueux et inclusif envers tous les contributeurs.

## Avant de commencer

- Fork le repository
- Clone votre fork: `git clone https://github.com/your-username/athlete-tracker.git`
- Créez une branche: `git checkout -b feature/ma-fonctionnalite`

## Développement

### Installation

```bash
npm install
cp .env.example .env.local
# Configurer vos variables d'environnement Supabase
npm run dev
```

### Standards de code

- **TypeScript strict**: Tous les fichiers doivent avoir les types complets
- **ESLint**: Exécuter `npm run lint` avant de committer
- **Prettier**: Format automatique (intégré dans la config ESLint)
- **Nommage**: 
  - Composants React: PascalCase (`MyComponent.tsx`)
  - Fonctions/variables: camelCase
  - Constantes: UPPER_SNAKE_CASE

### Structure des composants

```typescript
// Imports
import { useState } from 'react'
import type { Props } from './types'

// Types/Interfaces
interface MyComponentProps {
  title: string
  onClose: () => void
}

/**
 * Description JSDoc du composant
 */
export function MyComponent({ title, onClose }: MyComponentProps) {
  // State
  const [state, setState] = useState()

  // Effects
  // ... useEffect()

  // Handlers
  const handleClick = () => { ... }

  // Render
  return <div>...</div>
}
```

### Commits

Format:
```
<type>: <description>

<optional body>
```

Types:
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (sans changement de logique)
- `refactor`: Refactorisation
- `perf`: Optimisations
- `test`: Tests
- `chore`: Maintenance

Exemples:
```
feat: ajouter export en Excel des compétitions
fix: corriger bug du tri du tableau
docs: mettre à jour README avec exemples
```

## Testing

### Linting & Build

Avant de créer une PR:
```bash
npm run lint      # Vérifier ESLint
npm run build     # Vérifier la compilation
```

### Test manuel

1. Créer quelques compétitions
2. Tester chaque filtre indépendamment
3. Tester la pagination
4. Tester export Excel/PDF
5. Vérifier en dark mode
6. Tester navigation au clavier (Tab, Escape)

## Pull Request

1. Push vers votre fork
2. Ouvrir une PR sur `main`
3. Décrire les changements
4. Référencer les issues liées (#123)
5. Attendre la review

### Checklist PR

- [ ] Code lint passé (`npm run lint`)
- [ ] Build réussi (`npm run build`)
- [ ] Tests manuels effectués
- [ ] Documentation mise à jour
- [ ] Pas de breaking changes
- [ ] Commits avec messages clairs

## Domaines d'amélioration

### Priorité haute
- [ ] Tests unitaires et intégration
- [ ] E2E tests avec Cypress/Playwright
- [ ] Performance optimizations (lighthouse score)
- [ ] Pagination serveur pour larges datasets

### Priorité moyenne
- [ ] Drag-and-drop pour organiser les compétitions
- [ ] Graphiques/analytics de performance
- [ ] Support multi-langue (i18n)
- [ ] Thèmes customisables

### Priorité basse
- [ ] Mode offline avec localStorage
- [ ] Sync avec calendrier (Google Calendar, Outlook)
- [ ] Mobile app native

## Déboguer

### Browser DevTools

- F12 pour ouvrir DevTools
- Onglet Console pour erreurs
- Network pour voir les requêtes Supabase

### Logs Supabase

Dans Supabase Dashboard:
- SQL Editor: Exécuter des queries
- Logs: Voir les requêtes et erreurs RLS
- Realtime: Configurer les subscriptions

### VS Code Extensions

Recommandées:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Thunder Client (API testing)

## Documentation

- **JSDoc**: Documenter toutes les fonctions publiques
- **Inline comments**: Expliquer la logique complexe
- **README**: Instructions de setup
- **API.md**: Documentation des services

## Questions?

- Ouvrir une issue pour bug reports
- Discussions pour questions générales
- Email: contact@athlete-tracker.com

Merci pour votre contribution! 🎉
