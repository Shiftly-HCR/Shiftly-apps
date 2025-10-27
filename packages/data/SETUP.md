# Configuration de l'authentification Hestia

## Variables d'environnement requises

Pour faire fonctionner l'authentification, vous devez configurer les variables d'environnement suivantes dans votre application :

### Pour l'application web (apps/web)

Créez un fichier `.env.local` à la racine de `apps/web/` :

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_API_KEY=your-anon-key-here
```

### Pour l'application mobile (apps/mobile)

Créez un fichier `.env` à la racine de `apps/mobile/` :

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_API_KEY=your-anon-key-here
```

## Comment obtenir les clés Supabase

1. Créez un compte gratuit sur [https://supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Allez dans **Settings** → **API**
4. Copiez :
   - **Project URL** → `SUPABASE_URL`
   - **anon/public** key → `SUPABASE_API_KEY`

## Configuration de Supabase

### 1. Activer l'authentification par email

Dans votre projet Supabase :

1. Allez dans **Authentication** → **Providers**
2. Activez **Email**
3. Configurez les paramètres selon vos besoins

### 2. Activer l'authentification sociale (optionnel)

#### Google OAuth

1. Allez dans **Authentication** → **Providers**
2. Activez **Google**
3. Suivez les instructions pour créer un OAuth client dans Google Cloud Console
4. Ajoutez les credentials dans Supabase

#### Facebook OAuth

1. Allez dans **Authentication** → **Providers**
2. Activez **Facebook**
3. Suivez les instructions pour créer une app Facebook
4. Ajoutez les credentials dans Supabase

### 3. Configurer les URLs de redirection

Dans **Authentication** → **URL Configuration**, ajoutez :

**Pour le développement local :**

- `http://localhost:3000/home`
- `http://localhost:3000/auth/callback`

**Pour la production :**

- `https://your-domain.com/home`
- `https://your-domain.com/auth/callback`

## Test de l'implémentation

### 1. Démarrer l'application web

```bash
cd apps/web
pnpm dev
```

### 2. Tester l'inscription

1. Allez sur `http://localhost:3000/register`
2. Remplissez le formulaire
3. Soumettez
4. Vous devriez être redirigé vers `/home` après succès

### 3. Tester la connexion

1. Allez sur `http://localhost:3000/login`
2. Utilisez les identifiants créés
3. Vous devriez être redirigé vers `/home` après succès

### 4. Tester la protection des routes

1. Essayez d'accéder directement à `/home` sans être connecté
2. Vous devriez être redirigé vers `/login`

### 5. Tester la déconnexion

1. Connectez-vous
2. Sur la page `/home`, cliquez sur "Déconnexion" dans la navbar
3. Vous devriez être redirigé vers `/login`

## Vérification dans Supabase

Après avoir créé des utilisateurs, vous pouvez les voir dans :
**Authentication** → **Users** dans votre dashboard Supabase

## Données utilisateur

Les métadonnées de l'utilisateur (prénom, nom) sont stockées dans le champ `user_metadata` de l'utilisateur. Vous pouvez y accéder ainsi :

```typescript
const user = await getCurrentUser();
console.log(user?.user_metadata?.first_name);
console.log(user?.user_metadata?.last_name);
```

## Troubleshooting

### Erreur : "Invalid API key"

- Vérifiez que `SUPABASE_API_KEY` est bien la clé **anon/public** et non la service_role key
- Vérifiez que les variables d'environnement sont bien chargées (redémarrez le serveur de dev)

### Erreur : "Email not confirmed"

Par défaut, Supabase nécessite une confirmation d'email. Pour désactiver en développement :

1. Allez dans **Authentication** → **Providers** → **Email**
2. Désactivez "Confirm email"

### Redirection ne fonctionne pas avec OAuth

- Vérifiez que les URLs de redirection sont bien configurées dans Supabase
- Vérifiez que les credentials OAuth sont corrects

### L'utilisateur n'est pas persisté

- Le client Supabase utilise le localStorage par défaut pour persister la session
- Assurez-vous que `persistSession: true` est bien dans la configuration (déjà fait)
