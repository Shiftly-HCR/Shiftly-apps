export type SubscriptionPlanId =
  | "establishment"
  | "freelance-student"
  | "freelance-classic";

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  price: number; // montant mensuel TTC en euros
  priceCents: number;
  currency: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
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
  },
];

export const subscriptionPlansById = SUBSCRIPTION_PLANS.reduce(
  (acc, plan) => {
    acc[plan.id] = plan;
    return acc;
  },
  {} as Record<SubscriptionPlanId, SubscriptionPlan>
);
