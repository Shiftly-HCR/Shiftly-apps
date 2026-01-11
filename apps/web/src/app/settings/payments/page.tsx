"use client";

import { useEffect } from "react";
import { YStack, XStack, ScrollView, Text } from "tamagui";
import { useSearchParams, useRouter } from "next/navigation";
import { colors, Button } from "@shiftly/ui";
import { AppLayout, PageHeader } from "@/components";
import { useCurrentProfile } from "@/hooks";
import { useConnectOnboarding } from "@/hooks/stripe/useConnectOnboarding";
import {
  FiCheck,
  FiAlertTriangle,
  FiCreditCard,
  FiExternalLink,
  FiLoader,
} from "react-icons/fi";

export default function PaymentsSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, isLoading: isLoadingProfile } = useCurrentProfile();
  const {
    status,
    isLoading: isLoadingConnect,
    error,
    refreshStatus,
    startOnboarding,
  } = useConnectOnboarding();

  // Rafraîchir le statut au chargement et après retour de Stripe
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Gérer les retours de Stripe
  useEffect(() => {
    const urlStatus = searchParams.get("status");
    if (urlStatus === "success" || urlStatus === "refresh") {
      // Rafraîchir le statut après retour de Stripe
      refreshStatus();
      // Nettoyer l'URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("status");
      router.replace(newUrl.pathname);
    }
  }, [searchParams, refreshStatus, router]);

  // Vérifie si l'utilisateur peut accéder à cette page
  const canAccessConnect =
    profile?.role === "freelance" || profile?.role === "commercial";

  const handleStartOnboarding = async () => {
    const url = await startOnboarding();
    if (url) {
      window.location.href = url;
    }
  };

  // États d'affichage
  const isLoading = isLoadingProfile || isLoadingConnect;
  const isComplete = status?.onboardingStatus === "complete";
  const isPending = status?.onboardingStatus === "pending";
  const payoutsEnabled = status?.payoutsEnabled || false;
  const hasRequirements =
    status?.requirementsDue && status.requirementsDue.length > 0;

  if (isLoadingProfile) {
    return (
      <AppLayout>
        <YStack
          flex={1}
          backgroundColor="#F9FAFB"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
        >
          <Text fontSize={16} color="#6B7280">
            Chargement...
          </Text>
        </YStack>
      </AppLayout>
    );
  }

  if (!canAccessConnect) {
    return (
      <AppLayout>
        <YStack
          flex={1}
          backgroundColor="#F9FAFB"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          gap="$4"
        >
          <FiAlertTriangle size={48} color={colors.shiftlyMarron} />
          <Text fontSize={18} fontWeight="600" color={colors.gray900}>
            Accès non autorisé
          </Text>
          <Text fontSize={14} color={colors.gray700} textAlign="center">
            Cette page est réservée aux freelances et commerciaux.
          </Text>
        </YStack>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack
          maxWidth={800}
          width="100%"
          alignSelf="center"
          padding="$6"
          gap="$6"
        >
          {/* En-tête */}
          <PageHeader
            title="Paramètres de paiement"
            description="Configurez votre compte pour recevoir des paiements"
            align="left"
          />

          {/* Carte principale */}
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
          >
            {/* En-tête de la carte */}
            <XStack alignItems="center" gap="$3">
              <XStack
                width={48}
                height={48}
                borderRadius={24}
                backgroundColor={colors.shiftlyViolet + "20"}
                alignItems="center"
                justifyContent="center"
              >
                <FiCreditCard size={24} color={colors.shiftlyViolet} />
              </XStack>
              <YStack flex={1}>
                <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                  Compte Stripe Connect
                </Text>
                <Text fontSize={14} color={colors.gray500}>
                  {profile?.role === "freelance"
                    ? "Recevez vos paiements de missions"
                    : "Recevez vos commissions"}
                </Text>
              </YStack>
            </XStack>

            {/* Statut actuel */}
            <YStack
              padding="$4"
              backgroundColor={
                isComplete && payoutsEnabled
                  ? colors.shiftlyViolet + "10"
                  : isPending || hasRequirements
                    ? "#FEF3C7"
                    : colors.gray100
              }
              borderRadius="$3"
              gap="$3"
            >
              <XStack alignItems="center" gap="$2">
                {isComplete && payoutsEnabled ? (
                  <>
                    <FiCheck size={20} color={colors.shiftlyViolet} />
                    <Text
                      fontSize={16}
                      fontWeight="600"
                      color={colors.shiftlyViolet}
                    >
                      Compte activé
                    </Text>
                  </>
                ) : isPending || hasRequirements ? (
                  <>
                    <FiAlertTriangle size={20} color="#D97706" />
                    <Text fontSize={16} fontWeight="600" color="#D97706">
                      Configuration en attente
                    </Text>
                  </>
                ) : (
                  <>
                    <FiCreditCard size={20} color={colors.gray700} />
                    <Text fontSize={16} fontWeight="600" color={colors.gray700}>
                      Non configuré
                    </Text>
                  </>
                )}
              </XStack>

              {/* Description du statut */}
              <Text fontSize={14} color={colors.gray700}>
                {isComplete && payoutsEnabled
                  ? "Votre compte est configuré et prêt à recevoir des paiements. Les fonds seront automatiquement transférés vers votre compte bancaire."
                  : isPending
                    ? "Votre compte est en cours de vérification. Veuillez compléter les informations requises."
                    : hasRequirements
                      ? "Des informations supplémentaires sont requises pour activer votre compte."
                      : "Configurez votre compte pour commencer à recevoir des paiements de missions."}
              </Text>

              {/* Afficher les requirements si présents */}
              {hasRequirements && (
                <YStack gap="$2" marginTop="$2">
                  <Text fontSize={14} fontWeight="600" color={colors.gray900}>
                    Informations requises :
                  </Text>
                  {status?.requirementsDue.slice(0, 5).map((req, index) => (
                    <XStack key={index} alignItems="center" gap="$2">
                      <XStack
                        width={6}
                        height={6}
                        borderRadius={3}
                        backgroundColor="#D97706"
                      />
                      <Text fontSize={13} color={colors.gray700}>
                        {formatRequirement(req)}
                      </Text>
                    </XStack>
                  ))}
                  {status?.requirementsDue.length > 5 && (
                    <Text fontSize={13} color={colors.gray500}>
                      + {status.requirementsDue.length - 5} autres...
                    </Text>
                  )}
                </YStack>
              )}
            </YStack>

            {/* Informations sur les paiements */}
            <YStack gap="$2" paddingTop="$2">
              <XStack alignItems="center" justifyContent="space-between">
                <Text fontSize={14} color={colors.gray500}>
                  Virements activés
                </Text>
                <Text
                  fontSize={14}
                  fontWeight="600"
                  color={payoutsEnabled ? colors.shiftlyViolet : colors.gray500}
                >
                  {payoutsEnabled ? "Oui" : "Non"}
                </Text>
              </XStack>

              {status?.stripeAccountId && (
                <XStack alignItems="center" justifyContent="space-between">
                  <Text fontSize={14} color={colors.gray500}>
                    ID du compte
                  </Text>
                  <Text fontSize={14} fontWeight="500" color={colors.gray700}>
                    {status.stripeAccountId.slice(0, 15)}...
                  </Text>
                </XStack>
              )}
            </YStack>

            {/* Bouton d'action */}
            <XStack marginTop="$2">
              {isComplete && payoutsEnabled ? (
                <Button
                  variant="outline"
                  size="md"
                  onPress={handleStartOnboarding}
                  disabled={isLoading}
                  style={{ flex: 1 }}
                >
                  <XStack alignItems="center" gap="$2">
                    <Text>Modifier mes informations</Text>
                    <FiExternalLink size={16} />
                  </XStack>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onPress={handleStartOnboarding}
                  disabled={isLoading}
                  style={{ flex: 1 }}
                >
                  {isLoading ? (
                    <XStack alignItems="center" gap="$2">
                      <FiLoader size={16} className="animate-spin" />
                      <Text>Chargement...</Text>
                    </XStack>
                  ) : isPending || hasRequirements ? (
                    <XStack alignItems="center" gap="$2">
                      <Text>Compléter la configuration</Text>
                      <FiExternalLink size={16} />
                    </XStack>
                  ) : (
                    <XStack alignItems="center" gap="$2">
                      <Text>Activer mes paiements</Text>
                      <FiExternalLink size={16} />
                    </XStack>
                  )}
                </Button>
              )}
            </XStack>

            {/* Message d'erreur */}
            {error && (
              <XStack
                gap="$3"
                alignItems="flex-start"
                padding="$4"
                backgroundColor={colors.shiftlyMarron + "10"}
                borderRadius="$4"
                marginTop="$2"
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

          {/* Informations supplémentaires */}
          <YStack
            backgroundColor="white"
            borderRadius="$4"
            padding="$6"
            borderWidth={1}
            borderColor={colors.gray200}
            gap="$4"
          >
            <Text fontSize={18} fontWeight="600" color={colors.gray900}>
              Comment ça fonctionne ?
            </Text>

            <YStack gap="$4">
              <XStack gap="$3" alignItems="flex-start">
                <XStack
                  width={28}
                  height={28}
                  borderRadius={14}
                  backgroundColor={colors.shiftlyViolet + "20"}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    fontSize={14}
                    fontWeight="600"
                    color={colors.shiftlyViolet}
                  >
                    1
                  </Text>
                </XStack>
                <YStack flex={1} gap="$1">
                  <Text fontSize={15} fontWeight="600" color={colors.gray900}>
                    Configurez votre compte
                  </Text>
                  <Text fontSize={14} color={colors.gray500}>
                    Fournissez vos informations bancaires et d'identité via
                    Stripe.
                  </Text>
                </YStack>
              </XStack>

              <XStack gap="$3" alignItems="flex-start">
                <XStack
                  width={28}
                  height={28}
                  borderRadius={14}
                  backgroundColor={colors.shiftlyViolet + "20"}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    fontSize={14}
                    fontWeight="600"
                    color={colors.shiftlyViolet}
                  >
                    2
                  </Text>
                </XStack>
                <YStack flex={1} gap="$1">
                  <Text fontSize={15} fontWeight="600" color={colors.gray900}>
                    {profile?.role === "freelance"
                      ? "Réalisez des missions"
                      : "Générez des commissions"}
                  </Text>
                  <Text fontSize={14} color={colors.gray500}>
                    {profile?.role === "freelance"
                      ? "Lorsqu'un recruteur paie une mission, les fonds sont sécurisés."
                      : "Quand les établissements rattachés paient des missions, vous gagnez 6% de commission."}
                  </Text>
                </YStack>
              </XStack>

              <XStack gap="$3" alignItems="flex-start">
                <XStack
                  width={28}
                  height={28}
                  borderRadius={14}
                  backgroundColor={colors.shiftlyViolet + "20"}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    fontSize={14}
                    fontWeight="600"
                    color={colors.shiftlyViolet}
                  >
                    3
                  </Text>
                </XStack>
                <YStack flex={1} gap="$1">
                  <Text fontSize={15} fontWeight="600" color={colors.gray900}>
                    Recevez vos paiements
                  </Text>
                  <Text fontSize={14} color={colors.gray500}>
                    {profile?.role === "freelance"
                      ? "À la fin de la mission, vous recevez 85% du montant directement sur votre compte."
                      : "Les commissions sont automatiquement transférées sur votre compte bancaire."}
                  </Text>
                </YStack>
              </XStack>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}

/**
 * Formate un requirement Stripe en texte lisible
 */
function formatRequirement(requirement: string): string {
  const mapping: Record<string, string> = {
    "individual.verification.document": "Pièce d'identité",
    "individual.verification.additional_document": "Justificatif de domicile",
    "individual.first_name": "Prénom",
    "individual.last_name": "Nom",
    "individual.dob.day": "Date de naissance",
    "individual.dob.month": "Date de naissance",
    "individual.dob.year": "Date de naissance",
    "individual.address.line1": "Adresse",
    "individual.address.city": "Ville",
    "individual.address.postal_code": "Code postal",
    "individual.phone": "Numéro de téléphone",
    "individual.email": "Email",
    "external_account": "Compte bancaire (IBAN)",
    "tos_acceptance.date": "Acceptation des CGU",
    "tos_acceptance.ip": "Acceptation des CGU",
  };

  return mapping[requirement] || requirement.replace(/\./g, " > ");
}
