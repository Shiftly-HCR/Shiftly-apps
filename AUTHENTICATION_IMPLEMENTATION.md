# Implémentation de l'authentification Shiftly

## ✅ Résumé de l'implémentation

L'authentification a été mise en place avec succès pour l'application Shiftly. Voici ce qui a été implémenté :

### 📦 Package `@shiftly/data`

Le package contient maintenant toute la logique d'authentification réutilisable entre les applications web et mobile.

#### Fichiers créés/modifiés :

- **`packages/data/auth/auth.ts`** : Fonctions principales d'authentification
- **`packages/data/auth/index.ts`** : Exports du module auth
- **`packages/data/index.ts`** : Export général du package
- **`packages/data/tsconfig.json`** : Configuration TypeScript (ajout de "DOM")
- **`packages/data/README.md`** : Documentation complète du package
- **`packages/data/SETUP.md`** : Guide de configuration

#### Fonctions disponibles :

1. **`signUp({ email, password, firstName, lastName })`** - Inscription
2. **`signIn({ email, password })`** - Connexion
3. **`signOut()`** - Déconnexion
4. **`getCurrentUser()`** - Récupération de l'utilisateur connecté
5. **`getSession()`** - Récupération de la session active
6. **`signInWithGoogle()`** - Connexion via Google OAuth
7. **`signInWithFacebook()`** - Connexion via Facebook OAuth
8. **`resetPassword(email)`** - Réinitialisation du mot de passe

### 🌐 Application Web

#### Pages modifiées :

**`apps/web/src/app/login/page.tsx`** :

- ✅ Connexion par email/password
- ✅ Connexion Google/Facebook
- ✅ Gestion des erreurs
- ✅ Redirection vers `/home` après connexion réussie
- ✅ États de chargement

**`apps/web/src/app/register/page.tsx`** :

- ✅ Inscription avec prénom, nom, email, password
- ✅ Validation des champs (tous requis, mot de passe ≥ 8 caractères, correspondance)
- ✅ Connexion Google/Facebook
- ✅ Gestion des erreurs
- ✅ Redirection vers `/home` après inscription réussie
- ✅ États de chargement

**`apps/web/src/app/home/page.tsx`** :

- ✅ Protection de la route (redirection vers `/login` si non connecté)
- ✅ Affichage du nom de l'utilisateur dans la navbar
- ✅ Bouton de déconnexion fonctionnel
- ✅ État de chargement pendant la vérification d'authentification

### 🧩 Composants UI

**`packages/ui/src/components/Navbar.tsx`** :

- ✅ Ajout de la prop `onLogoutClick`
- ✅ Affichage du bouton "Déconnexion" quand fourni
- ✅ Style hover rouge pour le bouton de déconnexion

### 📝 Configuration requise

#### Variables d'environnement

Créez un fichier `.env.local` dans `apps/web/` :

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_API_KEY=your-anon-key-here
```

#### Configuration Supabase

1. Créez un compte sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez les clés dans **Settings** → **API**
4. Activez l'authentification email dans **Authentication** → **Providers**
5. (Optionnel) Configurez Google/Facebook OAuth

## 🚀 Comment tester

### 1. Installer les dépendances

```bash
pnpm install
```

### 2. Configurer les variables d'environnement

Créez `.env.local` dans `apps/web/` avec vos clés Supabase.

### 3. Lancer l'application

```bash
cd apps/web
pnpm dev
```

### 4. Tester le flux complet

1. **Inscription** : Allez sur `http://localhost:3000/register`
   - Créez un compte avec email/password
   - Vérifiez la redirection vers `/home`

2. **Déconnexion** : Cliquez sur "Déconnexion" dans la navbar
   - Vérifiez la redirection vers `/login`

3. **Protection des routes** : Essayez d'accéder à `/home` sans être connecté
   - Vérifiez la redirection automatique vers `/login`

4. **Connexion** : Allez sur `http://localhost:3000/login`
   - Connectez-vous avec vos identifiants
   - Vérifiez la redirection vers `/home`

## 📚 Documentation

- **`packages/data/README.md`** : Documentation complète de l'API
- **`packages/data/SETUP.md`** : Guide de configuration détaillé

## 🔒 Sécurité

- ✅ Mots de passe hashés par Supabase (bcrypt)
- ✅ Session persistante via localStorage (configurable)
- ✅ Protection CSRF native de Supabase
- ✅ Tokens JWT signés
- ✅ Validation côté serveur par Supabase

## 🔄 Flux d'authentification

### Inscription

```
User → Formulaire → signUp() → Supabase → Session créée → Redirection /home
```

### Connexion

```
User → Formulaire → signIn() → Supabase → Session récupérée → Redirection /home
```

### Protection de route

```
Page load → getCurrentUser() → User ? Afficher page : Redirection /login
```

### Déconnexion

```
User → Bouton → signOut() → Supabase → Session supprimée → Redirection /login
```

## 📱 Prochaines étapes pour l'app mobile

Le package `@shiftly/data` est déjà compatible React Native. Pour l'utiliser dans l'app mobile :

1. Ajouter la dépendance dans `apps/mobile/package.json` :

   ```json
   "@shiftly/data": "workspace:*"
   ```

2. Installer : `pnpm install`

3. Utiliser les mêmes fonctions que dans l'app web

4. Gérer la navigation avec `expo-router`

## ✨ Fonctionnalités bonus implémentées

- Messages d'erreur en français
- États de chargement avec feedback visuel
- Validation des formulaires côté client
- Affichage du nom utilisateur dans la navbar
- Design cohérent avec le reste de l'app
- Support OAuth Google/Facebook (nécessite configuration)

## 🐛 Dépannage

Si vous rencontrez des problèmes, consultez `packages/data/SETUP.md` section "Troubleshooting".

---

**Auteur** : Implémentation réalisée pour Shiftly  
**Date** : Octobre 2025  
**Version** : 1.0.0
