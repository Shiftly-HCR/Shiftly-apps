export type SubscriptionPlanId =
  | "establishment"
  | "establishment-annual"
  | "freelance-student"
  | "freelance-student-annual"
  | "freelance-classic"
  | "freelance-classic-annual";

export type BillingPeriod = "monthly" | "annual";

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  price: number; // montant TTC en euros
  priceCents: number;
  currency: string;
  description: string;
  features: string[];
  popular?: boolean;
  billingPeriod: BillingPeriod;
  monthlyPrice?: number; // Prix mensuel équivalent (pour affichage)
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  // Plans mensuels
  {
    id: "establishment",
    name: "Établissement",
    price: 50,
    priceCents: 5000,
    currency: "eur",
    description: "Pour les restaurants, hôtels et établissements HCR",
    features: [
      "Publication illimitée de missions",
      "Accès à tous les freelances",
      "Gestion des candidatures",
      "Support prioritaire",
      "Statistiques détaillées",
      "Recherche avancée",
    ],
    billingPeriod: "monthly",
  },
  {
    id: "freelance-student",
    name: "Freelance Étudiant",
    price: 25,
    priceCents: 2500,
    currency: "eur",
    description: "Tarif préférentiel pour les étudiants",
    features: [
      "Accès à toutes les missions",
      "Profil visible pour les recruteurs",
      "Notifications en temps réel",
      "Support client",
      "Gestion de disponibilité",
      "Historique des missions",
    ],
    popular: true,
    billingPeriod: "monthly",
  },
  {
    id: "freelance-classic",
    name: "Freelance Classique",
    price: 35,
    priceCents: 3500,
    currency: "eur",
    description: "Pour freelances et bénéficiaires Pôle Emploi",
    features: [
      "Accès à toutes les missions",
      "Profil visible pour les recruteurs",
      "Notifications en temps réel",
      "Support client",
      "Gestion de disponibilité",
      "Historique des missions",
      "Badge Pôle Emploi",
    ],
    billingPeriod: "monthly",
  },
  // Plans annuels (prix mensuel x 10 = 2 mois d'économies)
  {
    id: "establishment-annual",
    name: "Établissement",
    price: 500, // 50 x 10
    priceCents: 50000,
    currency: "eur",
    description: "Pour les restaurants, hôtels et établissements HCR",
    features: [
      "Publication illimitée de missions",
      "Accès à tous les freelances",
      "Gestion des candidatures",
      "Support prioritaire",
      "Statistiques détaillées",
      "Recherche avancée",
    ],
    billingPeriod: "annual",
    monthlyPrice: 41.67, // 500 / 12
  },
  {
    id: "freelance-student-annual",
    name: "Freelance Étudiant",
    price: 250, // 25 x 10
    priceCents: 25000,
    currency: "eur",
    description: "Tarif préférentiel pour les étudiants",
    features: [
      "Accès à toutes les missions",
      "Profil visible pour les recruteurs",
      "Notifications en temps réel",
      "Support client",
      "Gestion de disponibilité",
      "Historique des missions",
    ],
    popular: true,
    billingPeriod: "annual",
    monthlyPrice: 20.83, // 250 / 12
  },
  {
    id: "freelance-classic-annual",
    name: "Freelance Classique",
    price: 350, // 35 x 10
    priceCents: 35000,
    currency: "eur",
    description: "Pour freelances et bénéficiaires Pôle Emploi",
    features: [
      "Accès à toutes les missions",
      "Profil visible pour les recruteurs",
      "Notifications en temps réel",
      "Support client",
      "Gestion de disponibilité",
      "Historique des missions",
      "Badge Pôle Emploi",
    ],
    billingPeriod: "annual",
    monthlyPrice: 29.17, // 350 / 12
  },
];

export const subscriptionPlansById = SUBSCRIPTION_PLANS.reduce(
  (acc, plan) => {
    acc[plan.id] = plan;
    return acc;
  },
  {} as Record<SubscriptionPlanId, SubscriptionPlan>
);
