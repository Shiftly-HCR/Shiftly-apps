"use client";

import { YStack, XStack, Text, Spinner } from "tamagui";
import { Button, colors } from "@shiftly/ui";
import { useMissionPaymentStatus } from "@/hooks/stripe/useMissionPaymentStatus";
import {
  FiCheck,
  FiClock,
  FiDollarSign,
  FiSend,
  FiAlertCircle,
} from "react-icons/fi";

interface MissionPaymentBannerProps {
  missionId: string;
  isFreelance?: boolean;
  isRecruiter?: boolean;
  isFreelanceAccepted?: boolean;
}

/**
 * Bandeau affichant le statut du paiement d'une mission
 * Pour le freelance accepté sur la mission OU pour le recruteur
 */
export function MissionPaymentBanner({
  missionId,
  isFreelance = false,
  isRecruiter = false,
  isFreelanceAccepted = false,
}: MissionPaymentBannerProps) {
  const { paymentStatus, isLoading, isProcessing, error, releaseFunds } =
    useMissionPaymentStatus(missionId, isRecruiter);

  // Formater le montant en euros
  const formatAmount = (amountInCents: number | null) => {
    if (!amountInCents) return "0 €";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amountInCents / 100);
  };

  if (isLoading) {
    return null;
  }

  // ================================================================
  // VUE RECRUTEUR
  // ================================================================
  if (isRecruiter && paymentStatus) {
    // Paiement reçu - Peut libérer les fonds
    if (paymentStatus.status === "received") {
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
              <FiClock size={20} color={colors.blue600 || "#2563EB"} />
            </YStack>
            <YStack flex={1}>
              <Text
                fontSize={15}
                fontWeight="600"
                color={colors.blue800 || "#1E40AF"}
              >
                Paiement reçu - En attente de distribution
              </Text>
              <Text
                fontSize={13}
                color={colors.blue700 || "#1D4ED8"}
                marginTop="$1"
              >
                {formatAmount(paymentStatus.amount)} - Cliquez sur le bouton
                pour libérer les fonds au freelance.
              </Text>
            </YStack>
          </XStack>

          {paymentStatus.canRelease && (
            <XStack marginTop="$3" justifyContent="flex-end">
              <Button
                variant="primary"
                size="sm"
                onPress={releaseFunds}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <XStack alignItems="center" gap="$2">
                    <Spinner size="small" color={colors.white} />
                    <Text color={colors.white} fontSize={13}>
                      Distribution...
                    </Text>
                  </XStack>
                ) : (
                  <XStack alignItems="center" gap="$2">
                    <FiSend size={16} color={colors.white} />
                    <Text color={colors.white} fontSize={13} fontWeight="600">
                      Libérer les fonds
                    </Text>
                  </XStack>
                )}
              </Button>
            </XStack>
          )}

          {error && (
            <Text
              fontSize={12}
              color={colors.red600 || "#DC2626"}
              marginTop="$2"
            >
              {error}
            </Text>
          )}
        </YStack>
      );
    }

    // Fonds distribués
    if (paymentStatus.status === "distributed") {
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
              <Text
                fontSize={15}
                fontWeight="600"
                color={colors.green800 || "#065F46"}
              >
                Fonds distribués ✓
              </Text>
              <Text
                fontSize={13}
                color={colors.green700 || "#047857"}
                marginTop="$1"
              >
                {formatAmount(paymentStatus.amount)} - Les paiements ont été
                effectués.
              </Text>
            </YStack>
          </XStack>
        </YStack>
      );
    }

    // Erreur de distribution
    if (paymentStatus.status === "errored") {
      return (
        <YStack
          backgroundColor={colors.red50 || "#FEF2F2"}
          borderRadius={12}
          padding="$4"
          marginBottom="$4"
          borderWidth={1}
          borderColor={colors.red200 || "#FECACA"}
        >
          <XStack alignItems="center" gap="$3">
            <YStack
              backgroundColor={colors.red100 || "#FEE2E2"}
              borderRadius={100}
              padding="$2"
            >
              <FiAlertCircle size={20} color={colors.red600 || "#DC2626"} />
            </YStack>
            <YStack flex={1}>
              <Text
                fontSize={15}
                fontWeight="600"
                color={colors.red800 || "#991B1B"}
              >
                Erreur de distribution
              </Text>
              <Text
                fontSize={13}
                color={colors.red700 || "#B91C1C"}
                marginTop="$1"
              >
                Une erreur est survenue lors de la distribution des fonds.
                Contactez le support.
              </Text>
            </YStack>
          </XStack>
        </YStack>
      );
    }

    // Pas de paiement ou en attente - ne rien afficher pour le recruteur
    return null;
  }

  // ================================================================
  // VUE FREELANCE
  // ================================================================
  if (isFreelance && isFreelanceAccepted && paymentStatus) {
    // Ne pas afficher si pas de paiement ou paiement non effectué
    if (
      paymentStatus.status === "unpaid" ||
      paymentStatus.status === "pending"
    ) {
      return null;
    }

    // Paiement reçu (received) - Les fonds sont sécurisés
    if (paymentStatus.status === "received") {
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
              <Text
                fontSize={15}
                fontWeight="600"
                color={colors.blue800 || "#1E40AF"}
              >
                Paiement sécurisé 🔒
              </Text>
              <Text
                fontSize={13}
                color={colors.blue700 || "#1D4ED8"}
                marginTop="$1"
              >
                Le recruteur a payé cette mission. Vous recevrez{" "}
                <Text fontWeight="600">
                  {formatAmount(paymentStatus.freelancerAmount)}
                </Text>{" "}
                à la fin de la mission.
              </Text>
            </YStack>
          </XStack>
        </YStack>
      );
    }

    // Fonds distribués (distributed) - Le freelance a reçu son argent
    if (paymentStatus.status === "distributed") {
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
              <Text
                fontSize={15}
                fontWeight="600"
                color={colors.green800 || "#065F46"}
              >
                Paiement reçu ! 🎉
              </Text>
              <Text
                fontSize={13}
                color={colors.green700 || "#047857"}
                marginTop="$1"
              >
                <Text fontWeight="600">
                  {formatAmount(paymentStatus.freelancerAmount)}
                </Text>{" "}
                ont été versés sur votre compte Stripe.
              </Text>
            </YStack>
          </XStack>
        </YStack>
      );
    }
  }

  return null;
}
