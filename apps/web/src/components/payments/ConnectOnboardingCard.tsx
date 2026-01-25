"use client";

import { useEffect } from "react";
import { YStack, XStack, Text, Button, Spinner } from "tamagui";
import { colors } from "@shiftly/ui";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useConnectOnboarding } from "@/hooks/stripe";

interface ConnectOnboardingCardProps {
  onStatusChange?: (status: string) => void;
}

/**
 * Carte d'onboarding Stripe Connect pour freelances et commerciaux
 */
export function ConnectOnboardingCard({
  onStatusChange,
}: ConnectOnboardingCardProps) {
  const {
    isLoading,
    isCreatingAccount,
    isCreatingLink,
    error,
    connectStatus,
    fetchConnectStatus,
    startOnboarding,
    continueOnboarding,
  } = useConnectOnboarding();

  useEffect(() => {
    fetchConnectStatus();
  }, [fetchConnectStatus]);

  useEffect(() => {
    if (connectStatus?.onboardingStatus && onStatusChange) {
      onStatusChange(connectStatus.onboardingStatus);
    }
  }, [connectStatus?.onboardingStatus, onStatusChange]);

  const isProcessing = isCreatingAccount || isCreatingLink;

  // Affichage du statut
  const renderStatus = () => {
    if (!connectStatus) return null;

    const { onboardingStatus, payoutsEnabled } = connectStatus;

    if (onboardingStatus === "complete" && payoutsEnabled) {
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
            Paiements activés
          </Text>
        </XStack>
      );
    }

    if (onboardingStatus === "restricted") {
      return (
        <XStack
          backgroundColor="#EF444420"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$2"
          alignItems="center"
          gap="$2"
        >
          <AlertCircle size={16} color="#EF4444" />
          <Text fontSize={14} color="#EF4444" fontWeight="600">
            Action requise
          </Text>
        </XStack>
      );
    }

    if (onboardingStatus === "pending") {
      return (
        <XStack
          backgroundColor="#F59E0B20"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$2"
          alignItems="center"
          gap="$2"
        >
          <Clock size={16} color="#F59E0B" />
          <Text fontSize={14} color="#F59E0B" fontWeight="600">
            En cours de vérification
          </Text>
        </XStack>
      );
    }

    return null;
  };

  // Bouton d'action
  const renderAction = () => {
    if (!connectStatus) {
      return (
        <Button
          backgroundColor={colors.shiftlyViolet}
          color="white"
          onPress={startOnboarding}
          disabled={isProcessing}
          icon={isProcessing ? <Spinner color="white" size="small" /> : undefined}
        >
          {isProcessing ? "Configuration..." : "Activer mes paiements"}
        </Button>
      );
    }

    const { onboardingStatus, payoutsEnabled } = connectStatus;

    if (onboardingStatus === "complete" && payoutsEnabled) {
      return (
        <Text fontSize={14} color={colors.gray500}>
          Vous pouvez recevoir des paiements pour vos missions.
        </Text>
      );
    }

    if (onboardingStatus === "restricted" || onboardingStatus === "pending") {
      return (
        <Button
          backgroundColor={colors.shiftlyViolet}
          color="white"
          onPress={continueOnboarding}
          disabled={isProcessing}
          icon={
            isProcessing ? (
              <Spinner color="white" size="small" />
            ) : (
              <ExternalLink size={16} color="white" />
            )
          }
        >
          {isProcessing ? "Chargement..." : "Compléter ma vérification"}
        </Button>
      );
    }

    if (onboardingStatus === "not_started") {
      return (
        <Button
          backgroundColor={colors.shiftlyViolet}
          color="white"
          onPress={startOnboarding}
          disabled={isProcessing}
          icon={
            isProcessing ? (
              <Spinner color="white" size="small" />
            ) : (
              <CreditCard size={16} color="white" />
            )
          }
        >
          {isProcessing ? "Configuration..." : "Activer mes paiements"}
        </Button>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <YStack
        backgroundColor="white"
        borderRadius="$4"
        padding="$5"
        borderWidth={1}
        borderColor={colors.gray200}
        alignItems="center"
        justifyContent="center"
        minHeight={150}
      >
        <Spinner size="large" color={colors.shiftlyViolet} />
        <Text marginTop="$3" color={colors.gray500}>
          Chargement...
        </Text>
      </YStack>
    );
  }

  return (
    <YStack
      backgroundColor="white"
      borderRadius="$4"
      padding="$5"
      borderWidth={1}
      borderColor={colors.gray200}
      gap="$4"
    >
      {/* En-tête */}
      <XStack alignItems="center" justifyContent="space-between">
        <XStack alignItems="center" gap="$3">
          <YStack
            backgroundColor={`${colors.shiftlyViolet}20`}
            padding="$2"
            borderRadius="$3"
          >
            <CreditCard size={24} color={colors.shiftlyViolet} />
          </YStack>
          <YStack>
            <Text fontSize={18} fontWeight="600" color={colors.gray900}>
              Paiements
            </Text>
            <Text fontSize={14} color={colors.gray500}>
              Configurez vos paiements pour recevoir vos revenus
            </Text>
          </YStack>
        </XStack>
        {renderStatus()}
      </XStack>

      {/* Message d'erreur */}
      {error && (
        <XStack
          backgroundColor="#FEF2F2"
          padding="$3"
          borderRadius="$2"
          alignItems="center"
          gap="$2"
        >
          <AlertCircle size={16} color="#EF4444" />
          <Text fontSize={14} color="#EF4444">
            {error}
          </Text>
        </XStack>
      )}

      {/* Explication */}
      <YStack gap="$2">
        <Text fontSize={14} color={colors.gray600} lineHeight={22}>
          Pour recevoir vos paiements de missions, vous devez configurer votre
          compte de paiement sécurisé via Stripe.
        </Text>
        <Text fontSize={13} color={colors.gray500}>
          • Vérification d'identité requise{"\n"}
          • Compte bancaire pour les virements{"\n"}
          • 100% sécurisé par Stripe
        </Text>
      </YStack>

      {/* Action */}
      {renderAction()}
    </YStack>
  );
}
