"use client";

import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { useMissionPaymentStatus } from "@/hooks/stripe/useMissionPaymentStatus";
import { FiCheck, FiClock, FiDollarSign } from "react-icons/fi";

interface MissionPaymentBannerProps {
  missionId: string;
  isFreelance: boolean;
  isFreelanceAccepted?: boolean;
}

/**
 * Bandeau affichant le statut du paiement d'une mission
 * Pour le freelance accepté sur la mission
 */
export function MissionPaymentBanner({
  missionId,
  isFreelance,
  isFreelanceAccepted,
}: MissionPaymentBannerProps) {
  const { paymentStatus, isLoading } = useMissionPaymentStatus(missionId);

  // Formater le montant en euros
  const formatAmount = (amountInCents: number | null) => {
    if (!amountInCents) return "0 €";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amountInCents / 100);
  };

  // Ne pas afficher si pas freelance ou pas accepté ou pas de paiement effectué
  if (!isFreelance || !isFreelanceAccepted) {
    return null;
  }

  if (isLoading) {
    return null;
  }

  // Ne pas afficher si pas de paiement ou paiement non effectué
  if (!paymentStatus || paymentStatus.status === "unpaid") {
    return null;
  }

  // Paiement en attente (pending)
  if (paymentStatus.status === "pending") {
    return null; // Ne pas montrer le pending au freelance
  }

  // Paiement effectué (paid) - Les fonds sont sécurisés
  if (paymentStatus.status === "paid") {
    return (
      <YStack
        backgroundColor={colors.blue50 || "#EFF6FF"}
        borderRadius={12}
        padding="$4"
        marginBottom="$4"
        borderWidth={1}
        borderColor={colors.blue200 || "#BFDBFE"}
      >
        <XStack alignItems="center" gap="$3">
          <YStack
            backgroundColor={colors.blue100 || "#DBEAFE"}
            borderRadius={100}
            padding="$2"
          >
            <FiDollarSign size={20} color={colors.blue600 || "#2563EB"} />
          </YStack>
          <YStack flex={1}>
            <Text fontSize={15} fontWeight="600" color={colors.blue800 || "#1E40AF"}>
              Paiement sécurisé 🔒
            </Text>
            <Text fontSize={13} color={colors.blue700 || "#1D4ED8"} marginTop="$1">
              Le recruteur a payé cette mission. Vous recevrez{" "}
              <Text fontWeight="600">{formatAmount(paymentStatus.freelancerAmount)}</Text>{" "}
              à la fin de la mission.
            </Text>
          </YStack>
        </XStack>
      </YStack>
    );
  }

  // Fonds libérés (released) - Le freelance a reçu son argent
  if (paymentStatus.status === "released") {
    return (
      <YStack
        backgroundColor={colors.green50 || "#ECFDF5"}
        borderRadius={12}
        padding="$4"
        marginBottom="$4"
        borderWidth={1}
        borderColor={colors.green200 || "#A7F3D0"}
      >
        <XStack alignItems="center" gap="$3">
          <YStack
            backgroundColor={colors.green100 || "#D1FAE5"}
            borderRadius={100}
            padding="$2"
          >
            <FiCheck size={20} color={colors.green600 || "#059669"} />
          </YStack>
          <YStack flex={1}>
            <Text fontSize={15} fontWeight="600" color={colors.green800 || "#065F46"}>
              Paiement reçu ! 🎉
            </Text>
            <Text fontSize={13} color={colors.green700 || "#047857"} marginTop="$1">
              <Text fontWeight="600">{formatAmount(paymentStatus.freelancerAmount)}</Text>{" "}
              ont été versés sur votre compte Stripe.
            </Text>
          </YStack>
        </XStack>
      </YStack>
    );
  }

  return null;
}
