# Cron : libération automatique des fonds (release-payments)

## Vue d’ensemble

Un job **Vercel Cron** appelle **une fois par jour** l’API Next.js `POST /api/cron/release-payments`. Cette API libère les fonds des missions dont la **date de fin** (`missions.end_date`) est **dépassée** : transferts Stripe vers le freelance et le commercial (Stripe Connect), puis mise à jour des statuts en base.

---

## Fonctionnement détaillé

### 1. Déclenchement

- **Qui** : Vercel Cron (configuré dans `vercel.json`) appelle `POST /api/cron/release-payments` avec le header `Authorization: Bearer <CRON_SECRET>` (Vercel injecte la variable d’environnement `CRON_SECRET`).
- **Quand** : **tous les jours à 6h00 UTC** (`schedule: "0 6 * * *"`). Les crons ne s’exécutent qu’en production.

### 2. Sécurité

- L’endpoint vérifie que le header `Authorization` contient `Bearer <valeur>` et que la valeur est égale à **`process.env.CRON_SECRET`**. Toute requête sans ce secret ou avec un secret incorrect reçoit **401 Unauthorized**. Le secret n’est jamais stocké en base.

### 3. Idempotence

- La fonction SQL **`release_due_payments()`** ne retourne que les paiements avec `released_at IS NULL` et utilise **`FOR UPDATE SKIP LOCKED`** pour éviter les doubles traitements en cas d’exécutions concurrentes.
- L’API re-vérifie **`released_at IS NULL`** avant chaque transfert et skip si déjà libéré. La source de vérité est **`mission_payments.released_at`** : une fois renseigné, le paiement n’est plus redistribué.

### 4. Côté base de données (SQL)

- L’API appelle la fonction **`release_due_payments()`** (définie dans `packages/data/sql/stripe_connect/008_disputes_and_auto_release.sql`).
- Critères d’éligibilité :
  - `mission_payments.status = 'received'`
  - `mission_payments.has_dispute = false`
  - `mission_payments.released_at IS NULL`
  - `missions.end_date <= CURRENT_DATE` et `missions.end_date IS NOT NULL`

### 5. Côté API Next.js (`apps/web/src/app/api/cron/release-payments/route.ts`)

Pour **chaque** paiement retourné par `release_due_payments()` :

1. Re-vérification idempotence (`released_at` NULL), puis récupération du Charge Stripe.
2. Transfert freelance (si applicable) vers le compte Connect, insertion dans `mission_transfers`.
3. Transfert commercial (si applicable), insertion dans `mission_transfers`.
4. Mise à jour `mission_payments` (`released_at`, `status`, `distributed_at`) et `mission_finance` (`status`).

Les transferts sont tentés avec **retry** (3 tentatives, 2 s d’écart).

### 6. Données utilisées

- **Tables lues** : `mission_payments`, `missions`, `mission_finance`, `profiles`.
- **Tables écrites** : `mission_transfers`, `mission_payments`, `mission_finance`.
- **Trigger** : `update_payment_release_at` sur `missions` met à jour `mission_payments.release_at` quand `missions.end_date` change.

---

## Configuration (Vercel Cron)

### vercel.json

Le cron est déclaré à la racine du projet :

```json
{
  "crons": [
    {
      "path": "/api/cron/release-payments",
      "schedule": "0 6 * * *"
    }
  ]
}
```

### Variables d’environnement

Sur Vercel, définir **`CRON_SECRET`** (Production, et éventuellement Preview si vous testez) avec une valeur forte et secrète. Vercel l’envoie automatiquement en `Authorization: Bearer <CRON_SECRET>` lors de l’appel au cron. La même valeur doit être utilisée côté API pour la vérification (déjà en place dans l’endpoint).

### Vérification

- **Dashboard Vercel** : Projet → Settings → Cron Jobs (ou onglet dédié) pour voir le job et l’historique des exécutions.
- **Test manuel** : appeler l’endpoint avec curl en envoyant le bon header pour vérifier que la logique et le 401 fonctionnent.

Aucune dépendance à pg_cron, pg_net ou Supabase Vault : le scheduling et le secret sont entièrement gérés par Vercel et l’application.
