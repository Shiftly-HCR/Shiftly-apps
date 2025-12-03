# Stratégie de Cache - Shiftly Web App

## Vue d'ensemble

Ce document décrit la stratégie de cache mise en place pour réduire drastiquement les appels Supabase (Auth et Database) dans l'application web.

## Architecture

### 1. SessionProvider - Cache centralisé d'authentification

**Fichier**: `src/providers/SessionProvider.tsx`

Le `SessionProvider` est le cœur du système de cache. Il :

- **Charge UNE SEULE FOIS** la session et le profil utilisateur au montage
- **S'abonne à `onAuthStateChange`** pour mettre à jour automatiquement le cache lors des changements d'auth (login, logout, token refresh)
- **Expose le cache** via `useSessionContext()` et `useSessionCache()`
- **Gère le cache persistant** via `SessionCacheService` (packages/core)

**Avantages** :
- Plus besoin d'appeler `supabase.auth.getUser()` ou `getSession()` partout dans l'app
- Le cache est automatiquement mis à jour lors des événements d'auth
- Les données sont partagées entre tous les composants

### 2. QueryProvider - Cache React Query

**Fichier**: `src/providers/QueryProvider.tsx`

React Query est utilisé pour mettre en cache les requêtes de données (missions, profils, etc.).

**Configuration** :
- `staleTime`: 5 minutes - Les données sont considérées fraîches pendant 5 minutes
- `gcTime`: 30 minutes - Les données restent en cache 30 minutes après le dernier usage
- `refetchOnWindowFocus`: false - Ne pas refetch automatiquement au focus
- `refetchOnReconnect`: false - Ne pas refetch automatiquement à la reconnexion
- `retry`: 1 - Une seule tentative en cas d'erreur

**Avantages** :
- Les données sont partagées entre tous les composants qui utilisent les mêmes hooks
- Pas de requêtes redondantes pour les mêmes données
- Cache automatique avec invalidation intelligente

### 3. Hooks de cache

Tous les hooks de cache sont dans `src/hooks/cache/` :

#### `useSessionCache()`
Hook simple pour accéder au cache de session (session, user, profile, etc.)

#### `useCachedMissions()`
Récupère toutes les missions publiées avec cache React Query.

#### `useCachedMission(missionId)`
Récupère une mission spécifique depuis le cache ou Supabase.

#### `useCachedProfile(profileId)`
Récupère un profil depuis le cache ou Supabase.

#### `useCachedFreelanceData(userId)`
Récupère les expériences et formations d'un freelance avec cache.

## Règles d'utilisation

### ✅ À FAIRE

1. **Utiliser `useSessionCache()`** pour accéder à la session et au profil utilisateur
2. **Utiliser les hooks de cache** (`useCachedMissions`, `useCachedProfile`, etc.) pour les données
3. **Laisser React Query gérer le cache** - ne pas refaire de requêtes manuelles si un hook de cache existe

### ❌ À ÉVITER

1. **Ne pas appeler directement** `supabase.auth.getUser()` ou `getSession()` - utiliser `useSessionCache()` à la place
2. **Ne pas appeler directement** `getCurrentProfile()` - utiliser `useSessionCache()` ou `useCurrentProfile()`
3. **Ne pas faire de requêtes Supabase directes** dans les composants si un hook de cache existe pour cette donnée
4. **Ne pas utiliser `useState` + `useEffect`** pour charger des données - utiliser React Query avec les hooks de cache

## Exemples de migration

### Avant (❌)
```typescript
// ❌ Appel direct Supabase
const [user, setUser] = useState(null);
useEffect(() => {
  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };
  loadUser();
}, []);
```

### Après (✅)
```typescript
// ✅ Utilisation du cache
const { cache } = useSessionCache();
const user = cache?.user;
```

### Avant (❌)
```typescript
// ❌ Chargement manuel des missions
const [missions, setMissions] = useState([]);
useEffect(() => {
  const loadMissions = async () => {
    const data = await getPublishedMissions();
    setMissions(data);
  };
  loadMissions();
}, []);
```

### Après (✅)
```typescript
// ✅ Utilisation du hook de cache
const { data: missions = [], isLoading } = useCachedMissions();
```

## Impact attendu

- **Réduction drastique des appels Auth** : Un seul appel au montage, puis mise à jour automatique via `onAuthStateChange`
- **Réduction des appels Database** : Les données sont mises en cache et partagées entre les composants
- **Meilleure performance** : Moins de requêtes = application plus rapide
- **Meilleure expérience utilisateur** : Données disponibles instantanément depuis le cache

## Maintenance

### Ajouter un nouveau hook de cache

1. Créer un nouveau fichier dans `src/hooks/cache/`
2. Utiliser `useQuery` de React Query
3. Vérifier d'abord le cache SessionProvider si applicable
4. Exporter le hook dans `src/hooks/cache/index.ts`

### Invalider le cache

Pour forcer un refresh des données :
- **Session** : Utiliser `refresh()` depuis `useSessionCache()`
- **React Query** : Utiliser `queryClient.invalidateQueries()` ou `refetch()` depuis le hook

## Notes importantes

- **Le chat/realtime n'est PAS mis en cache** - Les hooks comme `useChat` continuent à écouter en direct
- **Les mutations** (création, mise à jour, suppression) doivent invalider le cache approprié après succès
- **Le cache est persistant** - Les données sont sauvegardées dans localStorage via SessionProvider

