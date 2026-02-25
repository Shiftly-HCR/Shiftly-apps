"use client";

import type { ReactNode } from "react";
import { YStack, XStack, Text } from "tamagui";
import { Button, BaseCard, colors } from "@shiftly/ui";
import { FiCheck } from "react-icons/fi";
import { useResponsive } from "@/hooks";

interface SubscriptionCardProps {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: ReactNode;
  features: string[];
  popular?: boolean;
  onSubscribe: (planId: string) => void;
  isLoading?: boolean;
  billingPeriod?: "monthly" | "annual";
  monthlyPrice?: number; // Prix mensuel équivalent pour les plans annuels
}

/**
 * Composant réutilisable pour afficher une carte d'abonnement
 */
export function SubscriptionCard({
  id,
  name,
  price,
  description,
  icon,
  features,
  popular = false,
  onSubscribe,
  isLoading = false,
  billingPeriod = "monthly",
  monthlyPrice,
}: SubscriptionCardProps) {
  const { isMobile } = useResponsive();

  return (
    <YStack
      flex={isMobile ? undefined : 1}
      width={isMobile ? "100%" : undefined}
      minWidth={isMobile ? undefined : 320}
      maxWidth={isMobile ? undefined : 400}
      position="relative"
    >
      {popular && (
        <YStack
          position="absolute"
          top={-12}
          alignSelf="center"
          zIndex={10}
          paddingHorizontal="$4"
          paddingVertical="$2"
          backgroundColor={colors.shiftlyViolet}
          borderRadius="$4"
        >
          <Text
            fontSize={12}
            fontWeight="700"
            color={colors.white}
            textTransform="uppercase"
          >
            Populaire
          </Text>
        </YStack>
      )}

      <BaseCard
        elevated={popular}
        clickable={false}
        padding="$6"
        gap="$5"
        borderWidth={popular ? 2 : 1}
        borderColor={popular ? colors.shiftlyViolet : colors.gray200}
        backgroundColor={colors.white}
        minHeight={600}
      >
        {/* Icône et nom */}
        <YStack alignItems="center" gap="$3">
          <YStack
            width={80}
            height={80}
            borderRadius={40}
            backgroundColor={colors.gray050}
            alignItems="center"
            justifyContent="center"
          >
            {icon}
          </YStack>
          <YStack alignItems="center" gap="$1">
            <Text fontSize={24} fontWeight="700" color={colors.gray900}>
              {name}
            </Text>
            <Text
              fontSize={14}
              color={colors.gray700}
              textAlign="center"
            >
              {description}
            </Text>
          </YStack>
        </YStack>

        {/* Prix */}
        <YStack alignItems="center" gap="$2">
          {billingPeriod === "annual" && monthlyPrice && (
            <XStack
              paddingHorizontal="$3"
              paddingVertical="$1"
              backgroundColor={colors.shiftlyViolet + "15"}
              borderRadius="$3"
              gap="$2"
            >
              <Text fontSize={12} fontWeight="600" color={colors.shiftlyViolet}>
                💰 Économisez 2 mois
              </Text>
            </XStack>
          )}
          <XStack alignItems="baseline" gap="$1">
            <Text fontSize={48} fontWeight="700" color={colors.gray900}>
              {billingPeriod === "annual" ? price : price}€
            </Text>
            <Text fontSize={18} color={colors.gray700}>
              TTC
            </Text>
          </XStack>
          {billingPeriod === "annual" ? (
            <YStack alignItems="center" gap="$1">
              <Text fontSize={14} color={colors.gray500}>
                par an
              </Text>
              {monthlyPrice && (
                <Text fontSize={14} color={colors.gray700} fontWeight="600">
                  Soit {monthlyPrice.toFixed(2)}€ / mois
                </Text>
              )}
            </YStack>
          ) : (
            <Text fontSize={14} color={colors.gray500}>
              par mois
            </Text>
          )}
        </YStack>

        {/* Liste des fonctionnalités */}
        <YStack gap="$3" flex={1}>
          {features.map((feature, index) => (
            <XStack key={index} gap="$3" alignItems="flex-start">
              <YStack
                width={20}
                height={20}
                borderRadius={10}
                backgroundColor={colors.shiftlyViolet + "20"}
                alignItems="center"
                justifyContent="center"
                marginTop={2}
                flexShrink={0}
              >
                <FiCheck
                  size={14}
                  color={colors.shiftlyViolet}
                  strokeWidth={3}
                />
              </YStack>
              <Text
                fontSize={15}
                color={colors.gray700}
                flex={1}
                lineHeight={22}
              >
                {feature}
              </Text>
            </XStack>
          ))}
        </YStack>

        {/* Bouton d'abonnement */}
        <Button
          variant={popular ? "primary" : "outline"}
          size="lg"
          onPress={() => onSubscribe(id)}
          disabled={isLoading}
          width="100%"
        >
          {isLoading
            ? "Redirection en cours..."
            : popular
              ? "Choisir ce plan"
              : "S'abonner"}
        </Button>
      </BaseCard>
    </YStack>
  );
}
