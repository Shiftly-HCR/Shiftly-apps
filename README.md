# 🧱 shiftly Apps Monorepo

**shiftly** est une plateforme SaaS de mise en relation entre **freelances du secteur Hôtellerie-Restauration (HCR)** et les **établissements** cherchant du renfort ponctuel.  
Ce monorepo contient l’ensemble des applications **web**, **mobile**, et des **packages partagés** du projet.

---

## 🚀 Stack Technique

| Catégorie            | Technologie                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Frontend Web**     | [Next.js 15](https://nextjs.org/) (App Router, TypeScript)                                                      |
| **Mobile App**       | [Expo](https://expo.dev/) (React Native 0.74, TypeScript)                                                       |
| **Backend / Data**   | [Supabase](https://supabase.io/) (PostgreSQL, Auth, Realtime, Storage)                                          |
| **ORM Serveur**      | [Prisma](https://www.prisma.io/) _(optionnel pour les fonctions serveur Next)_                                  |
| **Design System**    | [Tamagui](https://tamagui.dev/)                                                                                 |
| **State & Data**     | [TanStack Query](https://tanstack.com/query), [Zustand](https://zustand-demo.pmnd.rs/), [Zod](https://zod.dev/) |
| **Monorepo Tooling** | [Turborepo](https://turbo.build/) + [pnpm](https://pnpm.io/)                                                    |
| **CI/CD**            | [Vercel](https://vercel.com/) (Web) & [Expo EAS](https://expo.dev/eas) (Mobile)                                 |
| **Monitoring**       | [Sentry](https://sentry.io/), [PostHog](https://posthog.com/)                                                   |

---

## 📁 Structure du projet

```bash
shiftly-apps/
├─ apps/
│ ├─ web/ # Application Next.js (interface web)
│ └─ mobile/ # Application Expo (mobile)
│
├─ packages/
│ ├─ ui/ # Design system partagé (Tamagui / NativeWind)
│ ├─ core/ # Hooks, logique métier, schémas Zod, utils
│ └─ config/ # ESLint, tsconfig, prettier, etc.
│
├─ infra/ # (Optionnel) Scripts Supabase, migrations, policies RLS
│
├─ turbo.json # Configuration Turborepo
├─ pnpm-workspace.yaml
├─ package.json # Scripts et dépendances racine
├─ .gitignore
└─ README.md
```

---

## ⚙️ Installation & Démarrage

### 1️⃣ Prérequis

- **Node.js ≥ 18**
- **pnpm ≥ 9**
- **Supabase CLI** (pour développement local)
  ```bash
  npm install -g supabase
  ```

### 2️⃣ Cloner le repo

```bash
git clone https://github.com/shiftly/shiftly-apps.git
cd shiftly-apps
```

### 3️⃣ Installer les dépendances

```bash
pnpm install
```

### 4️⃣ Démarrer les applications en local

```bash
pnpm dev
```

## 🔐 variables d'environement

Crée un fichier .env à la racine du projet et ajoute :

```
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
SUPABASE_SERVICE_ROLE=<your_service_role_key>

STRIPE_SECRET_KEY=<your_stripe_secret_key>
LIVEKIT_API_KEY=<your_livekit_key>
LIVEKIT_API_SECRET=<your_livekit_secret>
SENTRY_DSN=<your_sentry_dsn>
```

⚠️ Ne jamais commit ce fichier.
Les environnements spécifiques (.env.local, .env.production) sont ignorés par Git.

## 🧠 Commandes utiles

| Commande          | Description                                       |
| ----------------- | ------------------------------------------------- |
| `pnpm dev`        | Lance toutes les apps en parallèle (web + mobile) |
| `pnpm dev:web`    | Lance uniquement l’app web (Next.js)              |
| `pnpm dev:mobile` | Lance uniquement l’app mobile (Expo)              |
| `pnpm build`      | Compile tout le monorepo                          |
| `pnpm lint`       | Vérifie la qualité du code (ESLint)               |
| `pnpm typecheck`  | Vérifie les types TypeScript                      |
| `pnpm clean`      | Nettoie les builds et caches                      |
| `pnpm format`     | Formate le code avec Prettier                     |

## 🧱 Roadmap Technique

- [x] Monorepo Turborepo + pnpm
- [ ] Apps Web (Next.js) & Mobile (Expo)
- [ ] Supabase (Auth + DB + Storage)
- [ ] Stripe Connect (paiements Premium & commissions)
- [ ] Chat Realtime (Supabase + LiveKit)
- [ ] Visio intégrée
- [ ] Analytics & monitoring (PostHog + Sentry)
- [ ] CI/CD (Vercel + EAS Build)
- [ ] Tests (Vitest / Detox)

## 👥 Auteurs et contributeurs

| Rôle               | Nom             |
| ------------------ | --------------- |
| **CEO / CFO**      | Howel Le Fur    |
| **COO / CSSO**     | William Halgand |
| **CTO / Dev Lead** | Julien Belinga  |

## 📄 Licence

Projet interne **shiftly SAS** — tous droits réservés.  
© 2025 – shiftly SAS.
