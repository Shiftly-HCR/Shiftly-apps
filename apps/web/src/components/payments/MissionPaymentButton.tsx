"use client";

import { useEffect } from "react";
import { XStack, Text, Button, Spinner } from "tamagui";
import { colors } from "@shiftly/ui";
import { CreditCard, CheckCircle, AlertCircle, Send } from "lucide-react";
import { useMissionPayment } from "@/hooks/stripe";

interface MissionPaymentButtonProps {
  missionId: string;
  isRecruiter: boolean;
  showReleaseButton?: boolean;
}

/**
 * Bouton de paiement/libération pour une mission
 */
export function MissionPaymentButton({
  missionId,
  isRecruiter,
  showReleaseButton = false,
}: MissionPaymentButtonProps) {
  const {
    isLoading,
    isCheckingOut,
    isReleasing,
    error,
    paymentStatus,
    fetchPaymentStatus,
    startCheckout,
    releaseFunds,
  } = useMissionPayment();

  useEffect(() => {
    fetchPaymentStatus(missionId);
  }, [missionId, fetchPaymentStatus]);

  if (isLoading) {
    return (
      <XStack alignItems="center" gap="$2" padding="$2">
        <Spinner size="small" color={colors.shiftlyViolet} />
        <Text fontSize={14} color={colors.gray500}>
          Chargement...
        </Text>
      </XStack>
    );
  }

  // Afficher le statut et les boutons appropriés
  const renderContent = () => {
    // Pas de paiement existant
    if (!paymentStatus) {
      if (!isRecruiter) return null;

      return (
        <Button
          backgroundColor={colors.shiftlyViolet}
          color="white"
          onPress={() => startCheckout(missionId)}
          disabled={isCheckingOut}
          icon={
            isCheckingOut ? (
              <Spinner color="white" size="small" />
            ) : (
              <CreditCard size={16} color="white" />
            )
          }
        >
          {isCheckingOut ? "Redirection..." : "Payer la mission"}
        </Button>
      );
    }

    const { status, amount, currency } = paymentStatus;
    const formattedAmount = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);

    // Mission payée mais fonds non libérés
    if (status === "paid") {
      return (
        <XStack alignItems="center" gap="$3" flexWrap="wrap">
          <XStack
            backgroundColor="#10B98120"
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius="$2"
            alignItems="center"
            gap="$2"
          >
            <CheckCircle size={16} color="#10B981" />
            <Text fontSize={14} color="#10B981" fontWeight="600">
              Payé {formattedAmount}
            </Text>
          </XStack>

          {showReleaseButton && isRecruiter && (
            <Button
              backgroundColor="#3B82F6"
              color="white"
              size="$3"
              onPress={() => releaseFunds(missionId)}
              disabled={isReleasing}
              icon={
                isReleasing ? (
                  <Spinner color="white" size="small" />
                ) : (
                  <Send size={14} color="white" />
                )
              }
            >
              {isReleasing ? "En cours..." : "Libérer les fonds"}
            </Button>
          )}
        </XStack>
      );
    }

    // Fonds libérés
    if (status === "released") {
      return (
        <XStack
          backgroundColor="#10B98120"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$2"
          alignItems="center"
          gap="$2"
        >
          <CheckCircle size={16} color="#10B981" />
          <Text fontSize={14} color="#10B981" fontWeight="600">
            Fonds libérés ({formattedAmount})
          </Text>
        </XStack>
      );
    }

    // Paiement échoué
    if (status === "failed") {
      return (
        <XStack alignItems="center" gap="$3" flexWrap="wrap">
          <XStack
            backgroundColor="#FEF2F2"
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius="$2"
            alignItems="center"
            gap="$2"
          >
            <AlertCircle size={16} color="#EF4444" />
            <Text fontSize={14} color="#EF4444" fontWeight="600">
              Paiement échoué
            </Text>
          </XStack>

          {isRecruiter && (
            <Button
              backgroundColor={colors.shiftlyViolet}
              color="white"
              size="$3"
              onPress={() => startCheckout(missionId)}
              disabled={isCheckingOut}
            >
              Réessayer
            </Button>
          )}
        </XStack>
      );
    }

    // Remboursé
    if (status === "refunded") {
      return (
        <XStack
          backgroundColor="#F59E0B20"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$2"
          alignItems="center"
          gap="$2"
        >
          <AlertCircle size={16} color="#F59E0B" />
          <Text fontSize={14} color="#F59E0B" fontWeight="600">
            Remboursé
          </Text>
        </XStack>
      );
    }

    // En attente
    if (status === "pending") {
      return (
        <XStack alignItems="center" gap="$3" flexWrap="wrap">
          <XStack
            backgroundColor="#F59E0B20"
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius="$2"
            alignItems="center"
            gap="$2"
          >
            <Spinner size="small" color="#F59E0B" />
            <Text fontSize={14} color="#F59E0B" fontWeight="600">
              Paiement en attente
            </Text>
          </XStack>

          {isRecruiter && (
            <Button
              backgroundColor={colors.shiftlyViolet}
              color="white"
              size="$3"
              onPress={() => startCheckout(missionId)}
              disabled={isCheckingOut}
            >
              Continuer le paiement
            </Button>
          )}
        </XStack>
      );
    }

    return null;
  };

  return (
    <XStack flexDirection="column" gap="$2">
      {error && (
        <XStack
          backgroundColor="#FEF2F2"
          padding="$2"
          borderRadius="$2"
          alignItems="center"
          gap="$2"
        >
          <AlertCircle size={14} color="#EF4444" />
          <Text fontSize={12} color="#EF4444">
            {error}
          </Text>
        </XStack>
      )}
      {renderContent()}
    </XStack>
  );
}
