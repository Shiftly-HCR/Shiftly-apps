# @hestia/data

Package de gestion des données et de l'authentification pour Hestia.

## Contenu

### Authentification (`auth/`)

Ce package fournit toutes les fonctions nécessaires pour gérer l'authentification des utilisateurs via Supabase.

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

### Configuration

#### Variables d'environnement

Créez un fichier `.env.local` à la racine de votre application avec les variables suivantes :

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_API_KEY=your-anon-key-here
```

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
import { signIn } from "@hestia/data";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const result = await signIn({ email, password });

    if (result.success) {
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
