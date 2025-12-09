"use client";

import { useState } from "react";
import { YStack, XStack, ScrollView, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import {
  AppLayout,
  PageHeader,
  SubscriptionCard,
  FAQSection,
} from "@/components";
import { FiHome, FiUser, FiBriefcase, FiAlertTriangle } from "react-icons/fi";
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from "@shiftly/payments/plans";

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

export default function SubscriptionPage() {
  const [loadingPlanId, setLoadingPlanId] = useState<SubscriptionPlanId | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planId: SubscriptionPlanId) => {
    setError(null);
    setLoadingPlanId(planId);

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.url) {
        throw new Error(
          data?.error || "Impossible de démarrer le paiement Stripe"
        );
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Erreur d'abonnement Stripe:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors du démarrage du paiement"
      );
    } finally {
      setLoadingPlanId(null);
    }
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
            {SUBSCRIPTION_PLANS.map((plan) => (
              <SubscriptionCard
                key={plan.id}
                id={plan.id}
                name={plan.name}
                price={plan.price}
                description={plan.description}
                icon={
                  plan.id === "establishment" ? (
                    <FiHome size={32} color={colors.shiftlyViolet} />
                  ) : plan.id === "freelance-student" ? (
                    <FiUser size={32} color={colors.shiftlyViolet} />
                  ) : (
                    <FiBriefcase size={32} color={colors.shiftlyViolet} />
                  )
                }
                features={plan.features}
                popular={plan.popular}
                onSubscribe={(planId: string) =>
                  handleSubscribe(planId as SubscriptionPlanId)
                }
                isLoading={loadingPlanId === plan.id}
              />
            ))}
          </XStack>

          {error && (
            <XStack
              gap="$3"
              alignItems="flex-start"
              padding="$4"
              backgroundColor={colors.shiftlyMarron + "10"}
              borderRadius="$4"
            >
              <FiAlertTriangle size={18} color={colors.shiftlyMarron} />
              <YStack gap="$1" flex={1}>
                <Text fontWeight="700" color={colors.shiftlyMarron}>
                  Paiement indisponible
                </Text>
                <Text color={colors.gray700}>{error}</Text>
              </YStack>
            </XStack>
          )}

          {/* Section FAQ ou informations supplémentaires */}
          <FAQSection title="Questions fréquentes" items={faqItems} />
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
