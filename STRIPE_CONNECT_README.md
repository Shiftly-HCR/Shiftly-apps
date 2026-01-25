# Stripe Connect - Guide de test local

Ce document explique comment tester l'implémentation Stripe Connect en local.

## Prérequis

1. **Stripe CLI** installé : [Installation Stripe CLI](https://stripe.com/docs/stripe-cli)
2. **Compte Stripe** avec accès au dashboard
3. **Variables d'environnement** configurées

## Variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```bash
# Stripe existantes (abonnements)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Connect (nouvelles)
STRIPE_CONNECT_RETURN_URL=http://localhost:3000/settings/payments?status=success
STRIPE_CONNECT_REFRESH_URL=http://localhost:3000/settings/payments?status=refresh

# Paiements missions (nouvelles)
STRIPE_CHECKOUT_SUCCESS_URL=http://localhost:3000/missions/{id}?payment=success
STRIPE_CHECKOUT_CANCEL_URL=http://localhost:3000/missions/{id}?payment=cancelled
```

## Appliquer les migrations SQL

Exécutez la migration SQL dans Supabase :

```sql
-- Fichier: packages/data/sql/stripe_connect_mission_payments.sql
-- Copier-coller le contenu dans l'éditeur SQL de Supabase
```

## Lancer le webhook listener

```bash
# Terminal 1 : Lancer Stripe CLI pour écouter les webhooks
stripe listen --forward-to localhost:3000/api/payments/webhook

# Notez le webhook secret (whsec_xxx) et mettez-le dans STRIPE_WEBHOOK_SECRET
```

## Événements webhook à configurer

Dans le dashboard Stripe → Developers → Webhooks, ajoutez ces événements :

### Événements existants (abonnements)
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

### Nouveaux événements (Connect + Missions)
- `account.updated` (Stripe Connect)
- `payment_intent.payment_failed` (Paiements missions)
- `charge.refunded` (Remboursements)

## Flow de test complet

### 1. Test Onboarding Connect (Freelance/Commercial)

1. Connectez-vous en tant que freelance ou commercial
2. Allez sur `/settings/payments`
3. Cliquez sur "Activer mes paiements"
4. Complétez l'onboarding Stripe (utiliser données de test)
5. Vérifiez que `connect_payouts_enabled` devient `true` dans le profil

**Données de test pour l'onboarding :**
- Numéro SSN : `000-00-0000`
- Numéro d'identification : `000000000`
- Date de naissance : n'importe quelle date passée
- Adresse : n'importe quelle adresse valide

### 2. Test Paiement Mission (Recruteur)

1. Connectez-vous en tant que recruteur
2. Créez une mission avec un tarif journalier ou total
3. Publiez la mission
4. Sur la page de la mission, cliquez sur "Payer la mission"
5. Utilisez une carte de test Stripe
6. Vérifiez que le statut passe à "payé"

**Cartes de test Stripe :**
- Succès : `4242 4242 4242 4242`
- Échec : `4000 0000 0000 0002`
- Authentification requise : `4000 0025 0000 3155`

**Date d'expiration :** N'importe quelle date future
**CVC :** N'importe quels 3 chiffres

### 3. Test Libération des fonds

1. Une mission doit être payée (status = "paid")
2. Un freelance doit être accepté pour la mission
3. Le freelance doit avoir un compte Connect activé
4. Appeler `POST /api/missions/{id}/release` (admin ou recruteur)
5. Vérifier que les transferts sont créés

```bash
# Test via curl
curl -X POST http://localhost:3000/api/missions/{mission_id}/release \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json"
```

## Répartition des fonds

- **Freelance** : 85% du montant payé
- **Plateforme** : 15% (ou 9% si commercial rattaché)
- **Commercial** : 6% si l'établissement a un commercial rattaché

**Exemple :** Mission payée 1000€
- Si pas de commercial : Freelance 850€, Plateforme 150€
- Si commercial : Freelance 850€, Commercial 60€, Plateforme 90€

## Commandes Stripe CLI utiles

```bash
# Lister les événements récents
stripe events list --limit 10

# Déclencher un événement de test
stripe trigger checkout.session.completed

# Vérifier un compte Connect
stripe accounts retrieve {account_id}

# Lister les transferts
stripe transfers list --limit 10
```

## Debug

### Vérifier les logs serveur
```bash
# Les logs sont affichés dans la console Next.js
# Cherchez les emojis pour identifier les étapes :
# 📥 = Requête reçue
# 🔄 = En cours de traitement
# ✅ = Succès
# ❌ = Erreur
# ⚠️ = Avertissement
```

### Vérifier les données Supabase
```sql
-- Vérifier les profils avec Connect
SELECT id, email, role, stripe_account_id, connect_onboarding_status, connect_payouts_enabled
FROM profiles
WHERE stripe_account_id IS NOT NULL;

-- Vérifier les paiements de missions
SELECT * FROM mission_payments ORDER BY created_at DESC;

-- Vérifier les finances
SELECT * FROM mission_finance ORDER BY created_at DESC;

-- Vérifier les transferts
SELECT * FROM mission_transfers ORDER BY created_at DESC;

-- Vérifier les événements Stripe traités
SELECT * FROM stripe_events ORDER BY created_at DESC LIMIT 20;
```

## Problèmes courants

### 1. "Webhook signature verification failed"
- Vérifiez que `STRIPE_WEBHOOK_SECRET` correspond au secret affiché par `stripe listen`
- Le secret change à chaque redémarrage de `stripe listen`

### 2. "Le freelance n'a pas de compte Connect"
- Le freelance doit compléter l'onboarding sur `/settings/payments`
- Vérifier que `connect_payouts_enabled = true`

### 3. "Aucun paiement complété trouvé"
- Vérifier que le paiement est passé (status = "paid")
- Vérifier que le webhook `checkout.session.completed` a été reçu

### 4. Les transferts échouent
- Vérifier que le compte Connect est vérifié
- En mode test, certaines fonctionnalités peuvent être limitées

## Mode production

En production, assurez-vous de :
1. Utiliser les clés API de production
2. Configurer les webhooks dans le dashboard Stripe (pas via CLI)
3. Vérifier tous les comptes Connect avant d'activer les virements
4. Mettre en place un monitoring des webhooks
