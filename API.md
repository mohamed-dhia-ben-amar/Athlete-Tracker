# API Documentation

## Services

### competitionService.ts

Service layer pour toutes les opérations CRUD sur les compétitions avec gestion d'erreurs.

#### fetchCompetitions()

```typescript
export async function fetchCompetitions(): Promise<CompetitionRecord[]>
```

Récupère toutes les compétitions de l'utilisateur authentifié.

**Returns**: Promise<CompetitionRecord[]> - Tableau des enregistrements triés par date décroissante

**Throws**: Error si la requête échoue

**Example**:
```typescript
const competitions = await fetchCompetitions()
```

---

#### createCompetition(payload)

```typescript
export async function createCompetition(
  payload: CompetitionRecordInsert
): Promise<CompetitionRecord>
```

Crée une nouvelle compétition pour l'utilisateur authentifié.

**Parameters**:
- `payload: CompetitionRecordInsert` - Objet contenant les données de la compétition

**Returns**: Promise<CompetitionRecord> - La compétition créée avec son ID

**Throws**: Error si les données sont invalides ou si l'utilisateur n'est pas authentifié

**Example**:
```typescript
const newCompetition = await createCompetition({
  participant_type: 'athlète',
  participant_name: 'Jean Dupont',
  sport_type: 'sport individuel',
  discipline: 'Athlétisme',
  competition_name: 'Championnat régional',
  competition_datetime: '2026-08-15T10:00:00Z',
  location: 'Paris',
  stage: 'Finale',
  status: 'À venir',
  result: null,
  created_by: userId
})
```

---

#### updateCompetition(payload)

```typescript
export async function updateCompetition(
  payload: CompetitionRecordInsert & { id: string }
): Promise<CompetitionRecord>
```

Met à jour une compétition existante.

**Parameters**:
- `payload` - Objet avec `id` et les champs à mettre à jour

**Returns**: Promise<CompetitionRecord> - La compétition mise à jour

**Throws**: Error si l'ID n'existe pas ou si l'utilisateur n'est pas propriétaire

**Example**:
```typescript
const updated = await updateCompetition({
  id: 'uuid-123',
  status: 'Terminée',
  result: '1er place',
  // ... autres champs
})
```

---

#### deleteCompetition(id)

```typescript
export async function deleteCompetition(id: string): Promise<void>
```

Supprime une compétition.

**Parameters**:
- `id: string` - UUID de la compétition à supprimer

**Returns**: Promise<void>

**Throws**: Error si l'ID n'existe pas ou si l'utilisateur n'est pas propriétaire

**Example**:
```typescript
await deleteCompetition('uuid-123')
```

---

## Export Utils

### exportCompetitionsToExcel(records)

```typescript
export function exportCompetitionsToExcel(records: CompetitionRecord[]): void
```

Génère et télécharge un fichier Excel contenant les compétitions.

**Parameters**:
- `records: CompetitionRecord[]` - Tableau des compétitions à exporter

**Returns**: void (déclenche le téléchargement)

**File format**: XLSX avec colonnes formatées

**Filename pattern**: `competitions-YYYY-MM-DD.xlsx`

**Example**:
```typescript
const filtered = competitions.filter(c => c.status === 'Terminée')
exportCompetitionsToExcel(filtered)
```

---

### exportCompetitionsToPdf(records)

```typescript
export function exportCompetitionsToPdf(records: CompetitionRecord[]): void
```

Génère et télécharge un fichier PDF contenant les compétitions.

**Parameters**:
- `records: CompetitionRecord[]` - Tableau des compétitions à exporter

**Returns**: void (déclenche le téléchargement)

**Page format**: Landscape (A4)

**Filename pattern**: `competitions-YYYY-MM-DD.pdf`

**Example**:
```typescript
exportCompetitionsToPdf(competitions)
```

---

## Components

### Modal

Boîte de dialogue modale avec animations, gestion au clavier et accessibilité.

**Props**:
- `isOpen: boolean` - Contrôle l'affichage du modal
- `title: string` - Titre du modal
- `description?: string` - Description optionnelle
- `onClose: () => void` - Callback au fermeture
- `children: ReactNode` - Contenu du modal

**Features**:
- ESC pour fermer
- Backdrop click pour fermer
- Focus trapping
- ARIA labels automatiques

**Example**:
```tsx
<Modal
  isOpen={isOpen}
  title="Nouvelle compétition"
  onClose={() => setIsOpen(false)}
>
  <CompetitionForm />
</Modal>
```

---

### ConfirmDialog

Dialogue de confirmation pour actions destructrices.

**Props**:
- `isOpen: boolean`
- `title: string`
- `description: string`
- `confirmLabel?: string` (défaut: "Supprimer")
- `cancelLabel?: string` (défaut: "Annuler")
- `onConfirm: () => void`
- `onCancel: () => void`

**Example**:
```tsx
<ConfirmDialog
  isOpen={showDelete}
  title="Supprimer la compétition?"
  description={`Êtes-vous sûr de vouloir supprimer ${competition.name}?`}
  onConfirm={() => deleteCompetition(competition.id)}
  onCancel={() => setShowDelete(false)}
/>
```

---

### Toast & ToastContainer

Système de notifications animées.

**Usage**:
```tsx
// Dans le composant
const [toasts, setToasts] = useState([])

const addToast = (message, type = 'info') => {
  const id = Math.random().toString(36).substr(2, 9)
  setToasts(prev => [...prev, { id, message, type }])
}

const removeToast = (id) => {
  setToasts(prev => prev.filter(t => t.id !== id))
}

// Rendu
<ToastContainer toasts={toasts} onClose={removeToast} />

// Utilisation
addToast('Succès!', 'success')
addToast('Erreur!', 'error')
```

---

### Spinner

Indicateur de chargement animé.

**Props**:
- `size?: 'sm' | 'md' | 'lg'` (défaut: 'md')
- `className?: string` - Classes Tailwind supplémentaires

**Example**:
```tsx
{isLoading ? <Spinner /> : <Content />}
```

---

## Types

### CompetitionRecord

```typescript
interface CompetitionRecord {
  id: string
  created_by: string
  participant_type: string
  participant_name: string
  sport_type: string
  discipline: string
  competition_name: string
  competition_datetime: string
  location: string
  stage: string
  status: string
  result: string | null
  created_at: string
  updated_at: string
}
```

### CompetitionRecordInsert

```typescript
interface CompetitionRecordInsert {
  created_by: string
  participant_type: string
  participant_name: string
  sport_type: string
  discipline: string
  competition_name: string
  competition_datetime: string
  location: string
  stage: string
  status: string
  result: string | null
}
```

## Hooks

### useAuth()

Hook personnalisé pour l'authentification.

**Returns**:
```typescript
{
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}
```

**Example**:
```typescript
const auth = useAuth()

if (auth.loading) return <LoadingScreen />
if (!auth.user) return <LoginPage />

return <Dashboard />
```
