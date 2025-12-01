"use client";

import { YStack, XStack, ScrollView } from "tamagui";
import { colors } from "@shiftly/ui";
import {
  AppLayout,
  PageHeader,
  SubscriptionCard,
  FAQSection,
} from "@/components";
import { FiHome, FiUser, FiBriefcase } from "react-icons/fi";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: React.ReactNode;
  features: string[];
  popular?: boolean;
}

const faqItems = [
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer:
      "Oui, vous pouvez mettre à jour ou annuler votre abonnement à tout moment depuis votre profil.",
  },
  {
    question: "Y a-t-il un engagement ?",
    answer:
      "Non, tous nos abonnements sont sans engagement. Vous pouvez résilier à tout moment.",
  },
  {
    question: "Comment puis-je prouver mon statut étudiant ou Pôle Emploi ?",
    answer:
      "Vous devrez fournir une preuve lors de votre inscription. Nos équipes vérifieront votre éligibilité sous 48h.",
  },
];

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "establishment",
    name: "Établissement",
    price: 50,
    description: "Pour les restaurants, hôtels et établissements HCR",
    icon: <FiHome size={32} color={colors.shiftlyViolet} />,
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
    description: "Tarif préférentiel pour les étudiants",
    icon: <FiUser size={32} color={colors.shiftlyViolet} />,
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
    description: "Pour freelances et bénéficiaires Pôle Emploi",
    icon: <FiBriefcase size={32} color={colors.shiftlyViolet} />,
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

export default function SubscriptionPage() {
  const handleSubscribe = (planId: string) => {
    // TODO: Implémenter la logique d'abonnement
    console.log(`Abonnement à ${planId}`);
  };

  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack
          maxWidth={1400}
          width="100%"
          alignSelf="center"
          padding="$6"
          gap="$8"
        >
          {/* En-tête */}
          <PageHeader
            title="Choisissez votre abonnement"
            description="Sélectionnez l'offre qui correspond le mieux à vos besoins et commencez à utiliser Shiftly dès aujourd'hui"
            align="center"
          />

          {/* Cartes d'abonnement */}
          <XStack
            flexWrap="wrap"
            gap="$6"
            justifyContent="center"
            alignItems="stretch"
            marginTop="$4"
          >
            {subscriptionPlans.map((plan) => (
              <SubscriptionCard
                key={plan.id}
                id={plan.id}
                name={plan.name}
                price={plan.price}
                description={plan.description}
                icon={plan.icon}
                features={plan.features}
                popular={plan.popular}
                onSubscribe={handleSubscribe}
              />
            ))}
          </XStack>

          {/* Section FAQ ou informations supplémentaires */}
          <FAQSection title="Questions fréquentes" items={faqItems} />
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
