# Athletes Tracker

Prototype initial — projet en développement.

## Installation

```bash
npm install
```

## Configuration Supabase

Copiez le fichier d'exemple et renseignez vos clés Supabase :

```bash
cp .env.example .env
```

Ensuite, importez ou exécutez le schéma SQL dans votre projet Supabase :

```bash
# À adapter selon votre méthode d'import
psql < supabase/schema.sql
```

Puis démarrez le projet :

```bash
npm run dev
```
