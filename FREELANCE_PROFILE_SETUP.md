# Configuration du Profil Freelance avec Import LinkedIn

Ce document décrit l'implémentation du système d'import LinkedIn et de gestion du profil freelance pour Shiftly.

## 📋 Vue d'ensemble

Le système permet aux utilisateurs avec le rôle `freelance` de :

1. Importer leurs données professionnelles depuis LinkedIn via SerpAPI
2. Compléter/modifier manuellement leur profil
3. Gérer leurs expériences, formations et compétences

## 🗂️ Structure des fichiers

### Backend

- **`apps/web/src/app/api/linkedin/route.ts`** : Route API Next.js pour l'import LinkedIn via SerpAPI
- **`packages/data/freelance/freelance.ts`** : Fonctions de gestion des données freelance (CRUD)
- **`packages/data/types/profile.ts`** : Types TypeScript pour les données LinkedIn et freelance
- **`packages/data/sql/create_freelance_tables.sql`** : Script SQL pour créer les tables nécessaires

### Frontend

- **`apps/web/src/components/FreelanceProfileForm.tsx`** : Composant formulaire complet pour les freelances
- **`apps/web/src/app/profile/page.tsx`** : Page de profil modifiée avec affichage conditionnel

## 🔧 Configuration

### Variables d'environnement

Ajoutez dans `apps/web/.env.local` :

```env
SERPAPI_KEY=votre_clé_api_serpapi
```

Pour obtenir une clé API SerpAPI :

1. Créez un compte sur [SerpAPI](https://serpapi.com/)
2. Récupérez votre clé API dans le dashboard
3. Ajoutez-la dans `.env.local`

### Base de données

Exécutez le script SQL pour créer les tables nécessaires :

```sql
-- Exécuter dans Supabase SQL Editor
-- Copier-coller le contenu de packages/data/sql/create_freelance_tables.sql
```

**⚠️ Important : Ce script est sûr à exécuter sur une base existante :**

- ✅ Utilise `CREATE TABLE IF NOT EXISTS` pour les nouvelles tables
- ✅ Vérifie l'existence des colonnes avant de les ajouter à `profiles`
- ✅ Utilise `DROP POLICY IF EXISTS` avant de créer les politiques RLS
- ✅ **Aucune donnée existante ne sera modifiée ou supprimée**

Ce script crée :

- `freelance_experiences` : Table des expériences professionnelles (si elle n'existe pas)
- `freelance_educations` : Table des formations (si elle n'existe pas)
- Ajoute les colonnes `headline`, `location`, `summary`, `skills` à la table `profiles` (uniquement si elles n'existent pas déjà)

## 📊 Structure des données

### Profil Freelance

Le profil freelance étend le profil de base avec :

- `headline` : Titre professionnel
- `location` : Localisation
- `summary` : Résumé professionnel
- `skills` : Tableau de compétences (TEXT[])

### Expériences

Chaque expérience contient :

- `title` : Intitulé du poste
- `company` : Entreprise
- `start_date` / `end_date` : Dates de début/fin
- `is_current` : Poste actuel (booléen)
- `location` : Localisation
- `description` : Description détaillée

### Formations

Chaque formation contient :

- `school` : École/Université
- `degree` : Diplôme
- `field` : Domaine d'études
- `start_date` / `end_date` : Dates

## 🚀 Utilisation

### Pour les développeurs

#### 1. Import LinkedIn

```typescript
// Dans le composant
const response = await fetch("/api/linkedin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ linkedinUrl: "https://www.linkedin.com/in/..." }),
});

const linkedInData = await response.json();
```

#### 2. Sauvegarder le profil

```typescript
import { updateFreelanceProfile } from "@shiftly/data";

await updateFreelanceProfile({
  firstName: "Jean",
  lastName: "Dupont",
  headline: "Développeur Full Stack",
  location: "Paris, France",
  summary: "Résumé...",
  skills: ["React", "Node.js"],
});
```

#### 3. Gérer les expériences

```typescript
import {
  getFreelanceExperiences,
  upsertFreelanceExperience,
  deleteFreelanceExperience,
} from "@shiftly/data";

// Récupérer
const experiences = await getFreelanceExperiences();

// Créer/Mettre à jour
await upsertFreelanceExperience({
  title: "Développeur",
  company: "Acme Corp",
  start_date: "2020-01-01",
  is_current: true,
});

// Supprimer
await deleteFreelanceExperience(experienceId);
```

### Pour les utilisateurs

1. **Se connecter** avec un compte ayant le rôle `freelance`
2. **Aller sur la page Profil** (`/profile`)
3. **Importer depuis LinkedIn** :
   - Entrer l'URL de votre profil LinkedIn
   - Cliquer sur "Importer"
   - Les données sont automatiquement pré-remplies
4. **Modifier les informations** si nécessaire
5. **Ajouter/Supprimer** des expériences, formations, compétences
6. **Enregistrer** le profil

## 🔒 Sécurité

- **RLS (Row Level Security)** : Les utilisateurs ne peuvent accéder qu'à leurs propres données
- **Validation côté serveur** : L'API vérifie l'URL LinkedIn avant l'appel SerpAPI
- **Authentification requise** : Toutes les opérations nécessitent une session active

## 🧪 Tests

### Test du flux complet

1. **Créer un compte freelance** :
   - Aller sur `/register`
   - Sélectionner "Freelance" comme type de compte
   - Compléter l'inscription

2. **Se connecter** :
   - Aller sur `/login`
   - Se connecter avec le compte freelance

3. **Accéder au profil** :
   - Aller sur `/profile`
   - Vérifier que la section "Importer depuis LinkedIn" est visible

4. **Importer depuis LinkedIn** :
   - Entrer une URL LinkedIn valide (ex: `https://www.linkedin.com/in/jean-dupont`)
   - Cliquer sur "Importer"
   - Vérifier que les données sont pré-remplies

5. **Modifier et sauvegarder** :
   - Modifier quelques champs
   - Ajouter une expérience manuellement
   - Ajouter une compétence
   - Cliquer sur "Enregistrer le profil"
   - Vérifier le message de succès

### Test avec un compte recruteur

1. Se connecter avec un compte `recruiter`
2. Aller sur `/profile`
3. Vérifier que le message "Cette section est réservée aux freelances" s'affiche

## 📝 Notes importantes

- **SerpAPI** : L'API SerpAPI nécessite un profil LinkedIn public pour fonctionner
- **Limites de taux** : SerpAPI a des limites de requêtes selon votre plan (gratuit : 100 recherches/mois)
- **Données sensibles** : Les données LinkedIn importées sont stockées dans Supabase et peuvent être modifiées par l'utilisateur

## 🐛 Dépannage

### Erreur "SERPAPI_KEY n'est pas définie"

- Vérifiez que la variable d'environnement est définie dans `.env.local`
- Redémarrez le serveur de développement

### Erreur "Profil LinkedIn introuvable"

- Vérifiez que l'URL LinkedIn est correcte
- Vérifiez que le profil LinkedIn est public
- Vérifiez votre clé API SerpAPI et vos crédits disponibles

### Les tables n'existent pas

- Exécutez le script SQL `create_freelance_tables.sql` dans Supabase
- Vérifiez que les politiques RLS sont correctement configurées

## 📚 Références

- [Documentation SerpAPI LinkedIn](https://serpapi.com/linkedin-profiles-api)
- [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
