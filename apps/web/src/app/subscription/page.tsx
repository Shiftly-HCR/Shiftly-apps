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
import {
  useCurrentProfile,
  useUpdatePremiumStatus,
  useCurrentUser,
} from "@/hooks";
import { useBillingPortal } from "@/hooks/stripe";
import { Button } from "@shiftly/ui";

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
  const { session } = useCurrentUser();
  const { updatePremium, isLoading: isUpdatingPremium } =
    useUpdatePremiumStatus();
  const { openPortal, isLoading: isLoadingPortal } = useBillingPortal();
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
      console.log("Début de l'abonnement pour le plan:", planId);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Ajouter le token dans les headers si disponible depuis la session
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
        console.log("Token ajouté aux headers");
      } else {
        console.log("Aucun token disponible");
      }

      console.log("Envoi de la requête vers /api/payments/checkout");
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers,
        credentials: "include", // Important: pour envoyer les cookies d'authentification
        body: JSON.stringify({ planId }),
      });

      console.log("Réponse reçue, status:", response.status);

      const data = await response.json().catch((jsonErr) => {
        console.error("Erreur lors du parsing JSON:", jsonErr);
        return null;
      });

      console.log("Données reçues:", data);

      if (!response.ok) {
        console.error("Erreur HTTP:", response.status, data);
        throw new Error(
          data?.error ||
            `Erreur ${response.status}: Impossible de démarrer le paiement Stripe`
        );
      }

      if (!data?.url) {
        console.error("Pas d'URL dans la réponse:", data);
        throw new Error("Aucune URL de paiement reçue");
      }

      console.log("Redirection vers:", data.url);
      window.location.href = data.url;
    } catch (err) {
      console.error("Erreur d'abonnement Stripe:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors du démarrage du paiement"
      );
      setLoadingPlanId(null);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Obtenir le statut d'abonnement avec label
  const getSubscriptionStatusLabel = (
    status: string | undefined | null
  ): string => {
    switch (status) {
      case "active":
        return "Actif";
      case "trialing":
        return "Période d'essai";
      case "past_due":
        return "Paiement en retard";
      case "canceled":
        return "Annulé";
      case "unpaid":
        return "Impayé";
      case "incomplete":
        return "Incomplet";
      case "incomplete_expired":
        return "Incomplet expiré";
      case "paused":
        return "En pause";
      default:
        return "Inconnu";
    }
  };

  // Si l'utilisateur a un abonnement Stripe (même s'il n'est pas premium)
  const hasStripeSubscription =
    profile?.stripe_customer_id && profile?.stripe_subscription_id;

  // Si l'utilisateur est premium ou a un abonnement Stripe, afficher les informations d'abonnement
  if (
    !isLoadingProfile &&
    (profile?.is_premium || hasStripeSubscription) &&
    currentPlan
  ) {
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
                    {profile?.is_premium
                      ? "Vous êtes abonné"
                      : "Votre abonnement"}
                  </Text>
                  <XStack alignItems="center" gap="$2">
                    {profile?.subscription_status === "active" ||
                    profile?.subscription_status === "trialing" ? (
                      <FiCheck size={18} color={colors.shiftlyViolet} />
                    ) : (
                      <FiAlertTriangle size={18} color={colors.shiftlyMarron} />
                    )}
                    <Text
                      fontSize={14}
                      color={
                        profile?.subscription_status === "active" ||
                        profile?.subscription_status === "trialing"
                          ? colors.shiftlyViolet
                          : colors.shiftlyMarron
                      }
                    >
                      {getSubscriptionStatusLabel(profile?.subscription_status)}
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

                {profile?.current_period_end && (
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                      Date de renouvellement
                    </Text>
                    <Text fontSize={14} color={colors.gray700}>
                      {formatDate(profile.current_period_end)}
                    </Text>
                  </XStack>
                )}

                {profile?.cancel_at_period_end && (
                  <XStack
                    justifyContent="space-between"
                    alignItems="center"
                    padding="$3"
                    backgroundColor={colors.shiftlyMarron + "10"}
                    borderRadius="$2"
                  >
                    <XStack alignItems="center" gap="$2">
                      <FiAlertTriangle size={16} color={colors.shiftlyMarron} />
                      <Text
                        fontSize={14}
                        fontWeight="600"
                        color={colors.shiftlyMarron}
                      >
                        Annulation programmée
                      </Text>
                    </XStack>
                    <Text fontSize={12} color={colors.gray700}>
                      Le {formatDate(profile.current_period_end)}
                    </Text>
                  </XStack>
                )}
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
                {profile?.cancel_at_period_end
                  ? "Votre abonnement prendra fin à la date de renouvellement."
                  : "Votre abonnement se renouvelle automatiquement tous les mois."}
              </Text>

              {/* Boutons de gestion */}
              {hasStripeSubscription && (
                <XStack gap="$3" marginTop="$4" justifyContent="center">
                  <Button
                    variant="primary"
                    size="md"
                    onPress={openPortal}
                    disabled={isLoadingPortal}
                  >
                    {isLoadingPortal ? "Chargement..." : "Gérer mon abonnement"}
                  </Button>
                </XStack>
              )}

              {error && (
                <XStack
                  gap="$3"
                  alignItems="flex-start"
                  padding="$4"
                  backgroundColor={colors.shiftlyMarron + "10"}
                  borderRadius="$4"
                  marginTop="$4"
                >
                  <FiAlertTriangle size={18} color={colors.shiftlyMarron} />
                  <YStack gap="$1" flex={1}>
                    <Text fontWeight="700" color={colors.shiftlyMarron}>
                      Erreur
                    </Text>
                    <Text color={colors.gray700}>{error}</Text>
                  </YStack>
                </XStack>
              )}
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
