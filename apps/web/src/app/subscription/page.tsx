"use client";

import { useState, useEffect } from "react";
import { YStack, XStack, ScrollView, Text } from "tamagui";
import { useSearchParams, useRouter } from "next/navigation";
import { colors } from "@shiftly/ui";
import {
  AppLayout,
  PageHeader,
  SubscriptionCard,
  FAQSection,
} from "@/components";
import {
  FiHome,
  FiUser,
  FiBriefcase,
  FiAlertTriangle,
  FiCheck,
} from "react-icons/fi";
import {
  SUBSCRIPTION_PLANS,
  subscriptionPlansById,
  type SubscriptionPlanId,
} from "@shiftly/payments/plans";
import { useCurrentProfile, useUpdatePremiumStatus } from "@/hooks";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, isLoading: isLoadingProfile } = useCurrentProfile();
  const { updatePremium, isLoading: isUpdatingPremium } =
    useUpdatePremiumStatus();
  const [loadingPlanId, setLoadingPlanId] = useState<SubscriptionPlanId | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [hasProcessedPayment, setHasProcessedPayment] = useState(false);

  // Récupérer le plan d'abonnement actuel depuis le profil
  const currentPlan =
    profile?.subscription_plan_id &&
    subscriptionPlansById[profile.subscription_plan_id as SubscriptionPlanId];

  // Traiter le paiement réussi
  useEffect(() => {
    const status = searchParams.get("status");
    const plan = searchParams.get("plan") as SubscriptionPlanId | null;

    // Si le paiement est réussi et qu'on n'a pas encore traité
    if (
      status === "success" &&
      plan &&
      !hasProcessedPayment &&
      !isUpdatingPremium
    ) {
      setHasProcessedPayment(true);

      // Mettre à jour le statut premium avec le planId
      updatePremium(true, plan).then((result) => {
        if (result.success) {
          // Nettoyer les paramètres d'URL pour éviter de traiter plusieurs fois
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("status");
          newUrl.searchParams.delete("plan");
          router.replace(newUrl.pathname + newUrl.search);
        } else {
          setError(
            result.error || "Erreur lors de l'activation de l'abonnement"
          );
        }
      });
    }
  }, [
    searchParams,
    hasProcessedPayment,
    isUpdatingPremium,
    updatePremium,
    router,
  ]);

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

  // Si l'utilisateur est premium, afficher les informations d'abonnement
  if (!isLoadingProfile && profile?.is_premium && currentPlan) {
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
              title="Mon Abonnement"
              description="Gérez votre abonnement Shiftly"
              align="center"
            />

            {/* Carte d'abonnement actif */}
            <YStack
              backgroundColor="white"
              borderRadius="$4"
              padding="$6"
              borderWidth={1}
              borderColor={colors.gray200}
              shadowColor="rgba(0, 0, 0, 0.1)"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={1}
              shadowRadius={12}
              gap="$4"
              maxWidth={600}
              alignSelf="center"
              width="100%"
            >
              <XStack
                alignItems="center"
                justifyContent="space-between"
                marginBottom="$2"
              >
                <YStack gap="$1">
                  <Text fontSize={24} fontWeight="700" color={colors.gray900}>
                    Vous êtes abonné
                  </Text>
                  <XStack alignItems="center" gap="$2">
                    <FiCheck size={18} color={colors.shiftlyViolet} />
                    <Text fontSize={14} color={colors.gray700}>
                      Abonnement actif
                    </Text>
                  </XStack>
                </YStack>
              </XStack>

              <YStack
                padding="$4"
                backgroundColor={colors.shiftlyViolet + "10"}
                borderRadius="$3"
                gap="$3"
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                    Plan
                  </Text>
                  <Text
                    fontSize={16}
                    fontWeight="700"
                    color={colors.shiftlyViolet}
                  >
                    {currentPlan.name}
                  </Text>
                </XStack>

                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                    Prix
                  </Text>
                  <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                    {currentPlan.price} {currentPlan.currency.toUpperCase()}
                    <Text fontSize={14} fontWeight="400" color={colors.gray700}>
                      {" "}
                      / mois
                    </Text>
                  </Text>
                </XStack>

                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                    Description
                  </Text>
                  <Text
                    fontSize={14}
                    color={colors.gray700}
                    textAlign="right"
                    flex={1}
                  >
                    {currentPlan.description}
                  </Text>
                </XStack>
              </YStack>

              {/* Liste des fonctionnalités */}
              {currentPlan.features && currentPlan.features.length > 0 && (
                <YStack gap="$2" marginTop="$2">
                  <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                    Fonctionnalités incluses :
                  </Text>
                  <YStack gap="$2">
                    {currentPlan.features.map((feature, index) => (
                      <XStack key={index} alignItems="center" gap="$2">
                        <FiCheck size={16} color={colors.shiftlyViolet} />
                        <Text fontSize={14} color={colors.gray700}>
                          {feature}
                        </Text>
                      </XStack>
                    ))}
                  </YStack>
                </YStack>
              )}

              <Text
                fontSize={14}
                color={colors.gray700}
                textAlign="center"
                marginTop="$2"
              >
                Votre abonnement se renouvelle automatiquement tous les mois.
              </Text>
            </YStack>
          </YStack>
        </ScrollView>
      </AppLayout>
    );
  }

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
