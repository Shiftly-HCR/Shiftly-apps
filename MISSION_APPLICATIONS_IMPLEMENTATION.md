# Implémentation du système de candidatures aux missions

## 📋 Résumé

Ce document décrit l'implémentation complète du système de candidatures aux missions pour la plateforme Shiftly. Le système permet aux freelances de postuler aux missions et aux recruteurs de gérer les candidatures.

---

## 1. 🗄️ Modélisation BDD : Table `mission_applications`

### 1.1. Description de la table

La table `mission_applications` a été créée pour gérer les candidatures des freelances aux missions. Elle contient :

- **id** (UUID) : Identifiant unique de la candidature
- **mission_id** (UUID, FK) : Référence vers la mission (`missions.id`)
- **user_id** (UUID, FK) : Référence vers le freelance (`auth.users.id`)
- **status** (TEXT) : Statut de la candidature avec contrainte CHECK
  - Valeurs possibles : `applied`, `shortlisted`, `rejected`, `accepted`, `withdrawn`
  - Valeur par défaut : `applied`
- **cover_letter** (TEXT, optionnel) : Message de motivation du freelance
- **created_at** (TIMESTAMPTZ) : Date de création
- **updated_at** (TIMESTAMPTZ) : Date de dernière mise à jour

### 1.2. Contraintes et index

- **Contrainte d'unicité** : `UNIQUE (mission_id, user_id)` - Empêche un freelance de postuler deux fois à la même mission
- **Clés étrangères** :
  - `mission_id` → `missions.id` (ON DELETE CASCADE)
  - `user_id` → `auth.users.id` (ON DELETE CASCADE)
- **Index** :
  - `idx_mission_applications_mission` sur `mission_id`
  - `idx_mission_applications_user` sur `user_id`
  - `idx_mission_applications_status` sur `status`
  - `idx_mission_applications_created` sur `created_at DESC`

### 1.3. Sécurité (RLS)

- Les freelances peuvent voir et créer leurs propres candidatures
- Les recruteurs peuvent voir les candidatures de leurs missions
- Les recruteurs peuvent modifier le statut des candidatures de leurs missions
- Les freelances peuvent modifier leurs propres candidatures (pour retirer ou mettre à jour)

---

## 2. 📝 Requêtes SQL

### 2.1. Fichier SQL complet

Le fichier SQL complet se trouve dans :

```
packages/data/sql/create_mission_applications_table.sql
```

Ce fichier contient :

- La création de la table avec toutes les colonnes
- Les contraintes (clés étrangères, unicité, CHECK)
- Les index pour optimiser les performances
- Les politiques RLS (Row Level Security)
- Le trigger pour mettre à jour `updated_at` automatiquement
- Les commentaires sur la table et les colonnes

### 2.2. Requêtes de jointure principales

#### Récupérer toutes les candidatures d'une mission avec les profils des freelances

```sql
SELECT
  ma.*,
  p.id as profile_id,
  p.first_name,
  p.last_name,
  p.email,
  p.phone,
  p.photo_url,
  p.bio,
  p.headline,
  p.location,
  p.role
FROM mission_applications ma
INNER JOIN profiles p ON ma.user_id = p.id
WHERE ma.mission_id = $1
ORDER BY ma.created_at DESC;
```

Cette requête est implémentée dans la fonction `getApplicationsByMission()` du fichier `packages/data/applications/applications.ts`.

#### Récupérer toutes les missions auxquelles un freelance a postulé avec le statut

```sql
SELECT
  ma.*,
  m.id as mission_id,
  m.title,
  m.description,
  m.city,
  m.start_date,
  m.end_date,
  m.hourly_rate,
  m.status as mission_status
FROM mission_applications ma
INNER JOIN missions m ON ma.mission_id = m.id
WHERE ma.user_id = $1
ORDER BY ma.created_at DESC;
```

Cette requête est implémentée dans la fonction `getApplicationsByUser()` du fichier `packages/data/applications/applications.ts`.

---

## 3. 📁 Fichiers créés et modifiés

### 3.1. Packages - Types (`packages/data/types`)

**Créé :**

- `packages/data/types/application.ts` : Types TypeScript pour les candidatures
  - `ApplicationStatus` : Enum des statuts possibles
  - `MissionApplication` : Type de base pour une candidature
  - `MissionApplicationWithProfile` : Candidature avec profil du freelance
  - `MissionApplicationWithMission` : Candidature avec informations de la mission
  - `CreateApplicationParams` : Paramètres pour créer une candidature
  - `UpdateApplicationParams` : Paramètres pour mettre à jour une candidature

### 3.2. Packages - Accès données (`packages/data`)

**Créé :**

- `packages/data/sql/create_mission_applications_table.sql` : Script SQL de création de la table
- `packages/data/applications/applications.ts` : Services d'accès aux données
  - `createApplication()` : Créer une candidature
  - `checkApplicationExists()` : Vérifier si une candidature existe
  - `getApplicationById()` : Récupérer une candidature par ID
  - `getApplicationsByMission()` : Récupérer toutes les candidatures d'une mission
  - `getApplicationsByUser()` : Récupérer toutes les candidatures d'un freelance
  - `updateApplicationStatus()` : Mettre à jour le statut d'une candidature
  - `updateApplication()` : Mettre à jour une candidature (statut et/ou message)
  - `withdrawApplication()` : Retirer une candidature
- `packages/data/applications/index.ts` : Exports du module

**Modifié :**

- `packages/data/index.ts` : Ajout des exports pour `applications` et `types/application`

### 3.3. Packages - Logique métier (`packages/core`)

**Créé :**

- `packages/core/applications/service.ts` : Logique métier pour les candidatures
  - `applyToMission()` : Postuler à une mission (avec toutes les validations)
  - `getMissionApplications()` : Récupérer les candidatures d'une mission (pour recruteurs)
  - `updateApplicationStatus()` : Mettre à jour le statut (avec validations de permissions et transitions)
  - `getUserApplications()` : Récupérer les candidatures d'un freelance
- `packages/core/applications/index.ts` : Exports du module

**Modifié :**

- `packages/core/index.ts` : Ajout de l'export pour `applications`

### 3.4. Application Web - Hooks (`apps/web/src/hooks`)

**Créé :**

- `apps/web/src/hooks/useApplyToMission.ts` : Hook pour postuler à une mission
- `apps/web/src/hooks/useMissionApplications.ts` : Hook pour récupérer les candidatures d'une mission
- `apps/web/src/hooks/useUserApplications.ts` : Hook pour récupérer les candidatures d'un freelance
- `apps/web/src/hooks/useUpdateApplicationStatus.ts` : Hook pour mettre à jour le statut d'une candidature
- `apps/web/src/hooks/useCheckApplication.ts` : Hook pour vérifier si l'utilisateur a déjà postulé

**Modifié :**

- `apps/web/src/hooks/index.ts` : Ajout des exports pour les nouveaux hooks

### 3.5. Application Web - Pages (`apps/web/src/app`)

**Modifié :**

- `apps/web/src/app/missions/[id]/page.tsx` : Page de détail de mission
  - Ajout de la logique pour postuler (bouton "Postuler à cette mission")
  - Ajout de la section de gestion des candidatures pour les recruteurs
  - Affichage conditionnel selon le rôle (freelance/recruteur)
  - Gestion des états (loading, erreurs, succès)

---

## 4. 🔄 Flux fonctionnel

### 4.1. Côté Freelance : Postuler à une mission

1. **Navigation** : Le freelance accède à la page de détail d'une mission (`/missions/[id]`)

2. **Vérification** :
   - Le hook `useCheckApplication()` vérifie si le freelance a déjà postulé
   - Le hook `useCurrentProfile()` vérifie que l'utilisateur est bien un freelance

3. **Affichage du bouton** :
   - Si déjà postulé : Affichage d'un message "Vous avez déjà postulé à cette mission"
   - Si non postulé et freelance : Affichage du bouton "Postuler à cette mission"
   - Si non freelance : Message "Connectez-vous en tant que freelance pour postuler"

4. **Clic sur "Postuler"** :
   - Le hook `useApplyToMission()` est appelé avec `mission_id`
   - La fonction `applyToMission()` de `packages/core` est exécutée :
     - ✅ Vérifie que l'utilisateur est authentifié
     - ✅ Vérifie que le profil a le rôle `freelance`
     - ✅ Vérifie que la mission existe et est `published`
     - ✅ Vérifie qu'il n'y a pas déjà une candidature
     - ✅ Appelle `createApplication()` de `packages/data`
   - `createApplication()` :
     - Vérifie l'unicité via `checkApplicationExists()`
     - Insère la ligne dans `mission_applications` via Supabase
     - Retourne le résultat

5. **Feedback utilisateur** :
   - Si succès : Message vert "✓ Candidature envoyée avec succès !"
   - Si erreur : Message d'erreur rouge avec le détail
   - La page se recharge automatiquement après succès pour mettre à jour l'état

### 4.2. Côté Recruteur : Voir et gérer les candidatures

1. **Navigation** : Le recruteur accède à la page de détail d'une de ses missions (`/missions/[id]`)

2. **Vérification** :
   - Le hook `useCurrentProfile()` vérifie que l'utilisateur est un recruteur
   - Vérification que `mission.recruiter_id === profile.id` (propriétaire de la mission)

3. **Affichage de la section candidatures** :
   - Si le recruteur est propriétaire : Affichage de la section "Candidatures (X)"
   - Le hook `useMissionApplications()` charge les candidatures :
     - Appelle `getMissionApplications()` de `packages/core`
     - Qui vérifie les permissions et appelle `getApplicationsByMission()` de `packages/data`
     - Retourne les candidatures avec les profils des freelances

4. **Affichage des candidatures** :
   - Pour chaque candidature, affichage :
     - Nom et prénom du freelance
     - Photo de profil (si disponible)
     - Headline et localisation
     - Statut actuel avec badge coloré
     - Message de motivation (si présent)
     - Date de candidature
   - Boutons d'action selon le statut :
     - `applied` → Peut passer à `shortlisted` ou `rejected`
     - `shortlisted` → Peut passer à `accepted` ou `rejected`
     - `rejected`, `accepted`, `withdrawn` → Aucun bouton (statut final)

5. **Changement de statut** :
   - Clic sur un bouton de statut (ex: "Présélectionner")
   - Le hook `useUpdateApplicationStatus()` est appelé
   - La fonction `updateApplicationStatus()` de `packages/core` :
     - ✅ Vérifie que l'utilisateur est authentifié
     - ✅ Vérifie que la candidature existe
     - ✅ Vérifie que la mission appartient au recruteur
     - ✅ Vérifie que la transition de statut est autorisée
     - ✅ Appelle `updateApplicationStatus()` de `packages/data`
   - Mise à jour dans la base de données
   - Rechargement automatique de la liste des candidatures

---

## 5. ✅ Confirmations

### 5.1. Un freelance ne peut pas postuler deux fois à la même mission

✅ **Implémenté et garanti à plusieurs niveaux :**

1. **Contrainte SQL** : `UNIQUE (mission_id, user_id)` dans la table `mission_applications`
2. **Vérification dans le service** : `checkApplicationExists()` avant création
3. **Vérification dans la logique métier** : `applyToMission()` vérifie l'existence avant de créer
4. **UI** : Le hook `useCheckApplication()` désactive le bouton si déjà postulé

### 5.2. Séparation UI / logique respectée

✅ **Architecture respectée :**

- **Aucun appel direct à Supabase dans les composants React**
- **Tous les accès à la base de données** sont dans `packages/data/applications/`
- **Toute la logique métier** est dans `packages/core/applications/`
- **Les composants UI** utilisent uniquement des hooks qui appellent les services
- **Les validations et règles métier** sont dans `packages/core`, pas dans l'UI

### 5.3. Code réutilisable dans packages/\*

✅ **Structure respectée :**

- **`packages/data`** : Tous les accès Supabase et requêtes SQL
- **`packages/core`** : Toute la logique métier réutilisable (indépendante de React)
- **`packages/data/types`** : Tous les types TypeScript partagés
- **`apps/web/src/hooks`** : Hooks React spécifiques à l'app web (glue entre UI et services)
- **`apps/web/src/app`** : Composants et pages UI uniquement

Le code dans `packages/*` peut être réutilisé tel quel dans l'application mobile.

---

## 6. 🚀 Utilisation

### 6.1. Installation de la table

Pour créer la table dans Supabase, exécutez le script SQL :

```sql
-- Exécuter le contenu du fichier :
packages/data/sql/create_mission_applications_table.sql
```

### 6.2. Utilisation dans le code

#### Postuler à une mission (côté freelance)

```typescript
import { useApplyToMission } from "@/hooks";

const { apply, isLoading, error, success } = useApplyToMission();

const handleApply = async () => {
  const result = await apply({ mission_id: "mission-id" });
  if (result.success) {
    console.log("Candidature envoyée !");
  }
};
```

#### Récupérer les candidatures d'une mission (côté recruteur)

```typescript
import { useMissionApplications } from "@/hooks";

const { applications, isLoading, refetch } = useMissionApplications(missionId);
```

#### Mettre à jour le statut d'une candidature

```typescript
import { useUpdateApplicationStatus } from "@/hooks";

const { updateStatus, isLoading } = useUpdateApplicationStatus();

const handleStatusChange = async (
  applicationId: string,
  newStatus: ApplicationStatus
) => {
  const result = await updateStatus(applicationId, newStatus);
  if (result.success) {
    console.log("Statut mis à jour !");
  }
};
```

---

## 7. 📊 Statuts et transitions

### Statuts disponibles

- **`applied`** : Candidature envoyée (statut initial)
- **`shortlisted`** : Présélectionné par le recruteur
- **`rejected`** : Refusé par le recruteur
- **`accepted`** : Accepté par le recruteur
- **`withdrawn`** : Retiré par le freelance

### Transitions autorisées

- `applied` → `shortlisted`, `rejected`, `withdrawn`
- `shortlisted` → `accepted`, `rejected`, `withdrawn`
- `rejected` → `withdrawn` (uniquement)
- `accepted` → `withdrawn` (uniquement)
- `withdrawn` → (aucune transition possible)

---

## 8. 🎯 Points d'attention

1. **Permissions** : Les politiques RLS garantissent que seuls les recruteurs propriétaires peuvent voir et modifier les candidatures de leurs missions
2. **Performance** : Les index sur `mission_id`, `user_id`, et `status` optimisent les requêtes courantes
3. **Intégrité** : La contrainte d'unicité empêche les doublons au niveau base de données
4. **UX** : Les messages d'erreur sont clairs et les états de chargement sont gérés
5. **Sécurité** : Toutes les opérations vérifient l'authentification et les permissions

---

## 9. 🔮 Améliorations futures possibles

- Notifications en temps réel lors de nouvelles candidatures (Supabase Realtime)
- Filtrage et tri des candidatures par statut, date, etc.
- Export des candidatures en CSV/PDF
- Système de notes/commentaires sur les candidatures
- Historique des changements de statut
- Email automatique lors des changements de statut

---

**Date de création** : 2025-01-XX  
**Version** : 1.0.0
