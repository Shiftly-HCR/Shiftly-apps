"use client";

import { useState } from "react";
import { YStack, XStack, Text, Spinner } from "tamagui";
import { Button, colors } from "@shiftly/ui";
import { useMissionPaymentStatus } from "@/hooks/stripe/useMissionPaymentStatus";
import { DisputeModal } from "@/components/dispute";
import {
  FiCheck,
  FiClock,
  FiDollarSign,
  FiAlertCircle,
  FiAlertTriangle,
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
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const { paymentStatus, isLoading, isProcessing, error, reportDispute } =
    useMissionPaymentStatus(missionId, isRecruiter);

  const handleReportDispute = async (
    reason: string,
    description?: string
  ): Promise<void> => {
    const result = await reportDispute(reason, description);
    if (result.success) {
      setShowDisputeModal(false);
    }
  };

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
    // Litige en cours
    if (paymentStatus.hasDispute) {
      return (
        <YStack
          backgroundColor={colors.yellow50 || "#FFFBEB"}
          borderRadius={12}
          padding="$4"
          marginBottom="$4"
          borderWidth={1}
          borderColor={colors.yellow200 || "#FDE68A"}
        >
          <XStack alignItems="center" gap="$3">
            <YStack
              backgroundColor={colors.yellow100 || "#FEF3C7"}
              borderRadius={100}
              padding="$2"
            >
              <FiAlertTriangle size={20} color={colors.yellow600 || "#D97706"} />
            </YStack>
            <YStack flex={1}>
              <Text
                fontSize={15}
                fontWeight="600"
                color={colors.yellow700 || "#B45309"}
              >
                Litige en cours ⚠️
              </Text>
              <Text
                fontSize={13}
                color={colors.yellow600 || "#D97706"}
                marginTop="$1"
              >
                Un problème a été signalé. La libération automatique des fonds est bloquée jusqu'à résolution.
              </Text>
            </YStack>
          </XStack>
        </YStack>
      );
    }

    // Paiement reçu - Peut signaler un problème
    if (paymentStatus.status === "received") {
      return (
        <>
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
                  Paiement reçu - Libération automatique prévue
                </Text>
                <Text
                  fontSize={13}
                  color={colors.blue700 || "#1D4ED8"}
                  marginTop="$1"
                >
                  {formatAmount(paymentStatus.amount)} - Les fonds seront libérés automatiquement à la fin de la mission.
                </Text>
              </YStack>
            </XStack>

            {paymentStatus.canReportDispute && (
              <XStack marginTop="$3" justifyContent="flex-end">
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => setShowDisputeModal(true)}
                  disabled={isProcessing}
                >
                  <XStack alignItems="center" gap="$2">
                    <FiAlertTriangle size={16} color={colors.yellow600 || "#D97706"} />
                    <Text
                      color={colors.yellow600 || "#D97706"}
                      fontSize={13}
                      fontWeight="600"
                    >
                      Signaler un problème
                    </Text>
                  </XStack>
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

          <DisputeModal
            open={showDisputeModal}
            onOpenChange={setShowDisputeModal}
            onConfirm={handleReportDispute}
          />
        </>
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
