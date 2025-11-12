# @hestia/data

Package de gestion des données et de l'authentification pour Hestia.

## Contenu

### Authentification (`auth/`)

Ce package fournit toutes les fonctions nécessaires pour gérer l'authentification des utilisateurs via Supabase.

**Note importante** : Lors de l'inscription d'un utilisateur avec `signUp()`, un profil est automatiquement créé dans la table `profiles` grâce à un trigger SQL et une création manuelle côté client. Voir la section [Profils](#profils-profiles) pour plus de détails.

#### Fonctions disponibles

##### `signUp(params: SignUpParams): Promise<AuthResponse>`

Inscrit un nouvel utilisateur.

```typescript
import { signUp } from "@hestia/data";

const result = await signUp({
  email: "user@example.com",
  password: "securePassword123",
  firstName: "Jean",
  lastName: "Dupont",
});

if (result.success) {
  console.log("Utilisateur créé:", result.user);
} else {
  console.error("Erreur:", result.error);
}
```

##### `signIn(params: SignInParams): Promise<AuthResponse>`

Connecte un utilisateur existant.

```typescript
import { signIn } from "@hestia/data";

const result = await signIn({
  email: "user@example.com",
  password: "securePassword123",
});

if (result.success) {
  console.log("Utilisateur connecté:", result.user);
} else {
  console.error("Erreur:", result.error);
}
```

##### `signOut(): Promise<AuthResponse>`

Déconnecte l'utilisateur actuel.

```typescript
import { signOut } from "@hestia/data";

const result = await signOut();

if (result.success) {
  console.log("Déconnexion réussie");
}
```

##### `getCurrentUser(): Promise<User | null>`

Récupère l'utilisateur actuellement connecté.

```typescript
import { getCurrentUser } from "@hestia/data";

const user = await getCurrentUser();

if (user) {
  console.log("Utilisateur connecté:", user.email);
} else {
  console.log("Aucun utilisateur connecté");
}
```

##### `getSession(): Promise<Session | null>`

Récupère la session actuelle.

```typescript
import { getSession } from "@hestia/data";

const session = await getSession();

if (session) {
  console.log("Session active:", session);
}
```

##### `signInWithGoogle(): Promise<AuthResponse>`

Connexion via Google OAuth.

```typescript
import { signInWithGoogle } from "@hestia/data";

const result = await signInWithGoogle();
```

##### `signInWithFacebook(): Promise<AuthResponse>`

Connexion via Facebook OAuth.

```typescript
import { signInWithFacebook } from "@hestia/data";

const result = await signInWithFacebook();
```

##### `resetPassword(email: string): Promise<AuthResponse>`

Envoie un email de réinitialisation de mot de passe.

```typescript
import { resetPassword } from "@hestia/data";

const result = await resetPassword("user@example.com");

if (result.success) {
  console.log("Email de réinitialisation envoyé");
}
```

### Profils (`profiles/`)

Ce package gère les profils utilisateurs stockés dans la table `profiles` de Supabase. Un profil est automatiquement créé lors de l'inscription d'un utilisateur.

#### Fonctions disponibles

##### `getCurrentProfile(): Promise<Profile | null>`

Récupère le profil de l'utilisateur actuellement connecté.

```typescript
import { getCurrentProfile } from "@hestia/data";

const profile = await getCurrentProfile();

if (profile) {
  console.log("Profil:", profile.first_name, profile.last_name);
}
```

##### `getProfileById(userId: string): Promise<Profile | null>`

Récupère un profil par son ID utilisateur.

```typescript
import { getProfileById } from "@hestia/data";

const profile = await getProfileById("user-uuid-here");
```

##### `updateProfile(params: UpdateProfileParams): Promise<{ success: boolean; error?: string; profile?: Profile }>`

Met à jour le profil de l'utilisateur actuel.

```typescript
import { updateProfile } from "@hestia/data";

const result = await updateProfile({
  firstName: "Jean",
  lastName: "Dupont",
  phone: "0612345678",
  bio: "Développeur passionné",
  photo_url: "https://example.com/photo.jpg",
});

if (result.success) {
  console.log("Profil mis à jour:", result.profile);
}
```

##### `createProfile(params: CreateProfileParams): Promise<{ success: boolean; error?: string; profile?: Profile }>`

Crée un nouveau profil (généralement appelé automatiquement lors de l'inscription).

```typescript
import { createProfile } from "@hestia/data";

const result = await createProfile({
  userId: "user-uuid",
  email: "user@example.com",
  firstName: "Jean",
  lastName: "Dupont",
  role: "recruiter",
});
```

##### `deleteProfile(): Promise<{ success: boolean; error?: string }>`

Supprime le profil de l'utilisateur actuel.

```typescript
import { deleteProfile } from "@hestia/data";

const result = await deleteProfile();

if (result.success) {
  console.log("Profil supprimé");
}
```

#### Types

##### `Profile`

```typescript
interface Profile {
  id: string;
  created_at?: string;
  updated_at?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  bio?: string;
  badges?: string;
  note?: number;
  phone?: string;
  email?: string;
}
```

##### `UpdateProfileParams`

```typescript
interface UpdateProfileParams {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  photo_url?: string;
}
```

##### `CreateProfileParams`

```typescript
interface CreateProfileParams {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}
```

### Configuration

#### Variables d'environnement

Créez un fichier `.env.local` à la racine de votre application avec les variables suivantes :

```env
# Pour Next.js
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Pour Expo / React Native
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

#### Configuration de la base de données

Pour lier l'authentification à la table `profiles` et créer automatiquement un profil lors de l'inscription :

1. Consultez le fichier `DATABASE_SETUP.md` pour les instructions détaillées
2. Exécutez le script SQL `sql/create_profile_trigger.sql` dans votre projet Supabase
3. Ce script crée un trigger qui automatiquement crée un profil dans la table `profiles` quand un utilisateur s'inscrit

**Important** : Sans ce trigger, les profils devront être créés manuellement après l'inscription.

#### Client Supabase

Le client Supabase est exporté et peut être utilisé directement :

```typescript
import { supabase } from "@hestia/data";

// Utiliser le client directement pour des opérations personnalisées
const { data, error } = await supabase.from("table_name").select("*");
```

## Utilisation dans les applications

### Next.js (Web)

1. Ajoutez le package comme dépendance dans `apps/web/package.json` :

```json
{
  "dependencies": {
    "@hestia/data": "workspace:*"
  }
}
```

2. Utilisez les fonctions dans vos composants :

```tsx
"use client";

import { useState } from "react";
import { signIn, getCurrentProfile } from "@hestia/data";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const result = await signIn({ email, password });

    if (result.success) {
      // Récupérer le profil de l'utilisateur connecté
      const profile = await getCurrentProfile();
      console.log("Utilisateur connecté:", profile);

      router.push("/home");
    } else {
      alert(result.error);
    }
  };

  // ... rest of component
}
```

#### Exemple complet d'inscription avec profil

```tsx
"use client";

import { useState } from "react";
import { signUp, getCurrentProfile } from "@hestia/data";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleRegister = async () => {
    // Inscription de l'utilisateur
    const result = await signUp({
      email,
      password,
      firstName,
      lastName,
    });

    if (result.success) {
      // Le profil est automatiquement créé grâce au trigger SQL
      // et à la fonction createProfile appelée dans signUp

      // Récupérer le profil créé
      const profile = await getCurrentProfile();
      console.log("Profil créé:", profile);

      router.push("/home");
    } else {
      alert(result.error);
    }
  };

  // ... rest of component
}
```

### Expo (Mobile)

Le package est également compatible avec React Native et Expo.

```tsx
import { signIn } from "@hestia/data";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = async () => {
    const result = await signIn({ email, password });

    if (result.success) {
      router.push("/home");
    }
  };

  // ... rest of component
}
```

## Protection des routes

Pour protéger une page et rediriger les utilisateurs non connectés :

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@hestia/data";

export default function ProtectedPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();

      if (!user) {
        router.push("/login");
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return <div>Contenu protégé</div>;
}
```

## Types

### `SignUpParams`

```typescript
interface SignUpParams {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
```

### `SignInParams`

```typescript
interface SignInParams {
  email: string;
  password: string;
}
```

### `AuthResponse`

```typescript
interface AuthResponse {
  success: boolean;
  error?: string;
  user?: any;
}
```
