# Configuration et Test des Webhooks Stripe

Ce document explique comment configurer et tester les webhooks Stripe pour la synchronisation des abonnements.

## Configuration

### Variables d'environnement requises

Assurez-vous d'avoir ces variables dans votre `.env` :

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Secret du webhook endpoint dans Stripe Dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # IMPORTANT: Service role pour les webhooks
```

### Migration de la base de données

Exécutez les migrations SQL dans l'ordre :

1. `packages/data/sql/add_stripe_subscription_fields.sql` - Ajoute les champs Stripe à `profiles` et crée la table `stripe_events`
2. `packages/data/sql/protect_stripe_fields_rls.sql` - Protège les champs Stripe contre les modifications utilisateur

## Test en développement local

### 1. Installer Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux / Windows
# Voir: https://stripe.com/docs/stripe-cli
```

### 2. Connecter Stripe CLI à votre compte

```bash
stripe login
```

### 3. Lancer le forward des webhooks vers votre serveur local

Dans un terminal séparé, lancez :

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

Cette commande :

- Crée un endpoint webhook temporaire dans Stripe
- Forward les événements vers votre serveur local
- Affiche le `webhook signing secret` (commence par `whsec_...`)

**Important** : Copiez le `webhook signing secret` affiché et ajoutez-le à votre `.env.local` :

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

Redémarrez votre serveur Next.js après avoir ajouté le secret.

### 4. Tester les événements

Une fois le forward actif, vous pouvez déclencher des événements de test :

```bash
# Test: Session de checkout complétée
stripe trigger checkout.session.completed

# Test: Abonnement créé
stripe trigger customer.subscription.created

# Test: Abonnement mis à jour
stripe trigger customer.subscription.updated

# Test: Abonnement annulé
stripe trigger customer.subscription.deleted

# Test: Facture payée
stripe trigger invoice.paid

# Test: Échec de paiement
stripe trigger invoice.payment_failed
```

### 5. Vérifier les logs

Les webhooks sont traités et loggés dans la console de votre serveur Next.js :

```
Webhook Stripe traité avec succès: customer.subscription.created (evt_...)
```

Si une erreur survient, elle sera également loggée.

## Production

### Configuration du webhook dans Stripe Dashboard

1. Allez dans [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquez sur "Add endpoint"
3. Entrez l'URL de votre endpoint : `https://votre-domaine.com/api/payments/webhook`
4. Sélectionnez les événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copiez le "Signing secret" et ajoutez-le à vos variables d'environnement de production

### Vérification des webhooks en production

1. Allez dans Stripe Dashboard > Webhooks
2. Sélectionnez votre endpoint
3. Consultez les logs des événements envoyés
4. Vérifiez les statuts (200 = succès, 500 = erreur)

## Architecture

### Flux des webhooks

1. **Stripe** envoie un événement → `/api/payments/webhook`
2. **Endpoint webhook** vérifie la signature Stripe
3. **Handlers** (`apps/web/src/hooks/stripe/webhookHandlers.ts`) :
   - Vérifient l'idempotence via `stripe_events`
   - Récupèrent le `userId` depuis les metadata
   - Met à jour `profiles` avec les informations Stripe via service role
4. **Base de données** : Les champs Stripe sont protégés (RLS + trigger) pour éviter les modifications utilisateur

### Champs synchronisés

- `stripe_customer_id` - ID du customer Stripe
- `stripe_subscription_id` - ID de l'abonnement Stripe
- `subscription_status` - Statut (active, trialing, canceled, etc.)
- `current_period_end` - Date de fin de période
- `cancel_at_period_end` - Annulation programmée
- `subscription_price_id` - ID du price Stripe
- `subscription_plan_id` - Plan interne (gardé pour compatibilité)
- `is_premium` - Calculé automatiquement (true si status = active/trialing)

### Idempotence

Chaque événement Stripe est enregistré dans `stripe_events` avec son `event.id`.
Si un événement est déjà traité, il est ignoré pour éviter les doublons.

## Dépannage

### "Signature Stripe invalide"

- Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
- En local, utilisez le secret affiché par `stripe listen`
- En production, utilisez le secret du webhook endpoint dans Stripe Dashboard

### "Event déjà traité"

C'est normal, cela signifie que l'idempotence fonctionne. L'événement est ignoré.

### "userId manquant dans les metadata"

- Vérifiez que le checkout inclut `userId` dans les metadata
- Vérifiez `/api/payments/checkout` pour s'assurer que `userId` est bien passé

### Les champs Stripe ne se mettent pas à jour

1. Vérifiez les logs du webhook
2. Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est configuré
3. Vérifiez que les migrations SQL ont été exécutées
4. Vérifiez les logs Supabase pour les erreurs de permission

## Ressources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
