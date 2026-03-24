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
  billingPeriod?: "weekly" | "monthly" | "annual";
  monthlyPrice?: number; // Prix mensuel équivalent pour les plans annuels
  ctaLabel?: string;
  priceDisplayLabel?: string;
  priceDetailsLabel?: string;
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
  ctaLabel,
  priceDisplayLabel,
  priceDetailsLabel,
}: SubscriptionCardProps) {
  const { isMobile } = useResponsive();
  const weeklyEquivalent =
    billingPeriod === "weekly"
      ? price
      : billingPeriod === "monthly"
        ? (price * 12) / 52
        : price / 52;

  const periodLabel =
    billingPeriod === "weekly"
      ? "SEMAINE"
      : billingPeriod === "annual"
        ? "AN"
        : "MOIS";
  const pricingSectionMinHeight = 210;

  return (
    <YStack
      flex={isMobile ? undefined : 1}
      width={isMobile ? "100%" : undefined}
      minWidth={isMobile ? undefined : 320}
      maxWidth={isMobile ? undefined : 400}
      height={isMobile ? undefined : "100%"}
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
        minHeight={620}
        height={isMobile ? undefined : "100%"}
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
        <YStack
          alignItems="center"
          justifyContent="center"
          gap="$2"
          minHeight={pricingSectionMinHeight}
        >
          <XStack
            paddingHorizontal="$3"
            paddingVertical="$1"
            backgroundColor={colors.shiftlyViolet}
            borderRadius="$3"
          >
            <Text fontSize={12} fontWeight="700" color={colors.white}>
              FACTURATION / {periodLabel}
            </Text>
          </XStack>

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
              {priceDisplayLabel ?? `${price}€`}
            </Text>
            {!priceDisplayLabel && (
              <Text fontSize={18} color={colors.gray700}>
                TTC
              </Text>
            )}
          </XStack>
          {priceDetailsLabel ? (
            <Text fontSize={14} color={colors.gray500} fontWeight="600">
              {priceDetailsLabel}
            </Text>
          ) : billingPeriod === "annual" ? (
            <YStack alignItems="center" gap="$1">
              <Text fontSize={14} color={colors.gray500}>
                par an
              </Text>
              {monthlyPrice && (
                <Text fontSize={14} color={colors.gray700} fontWeight="600">
                  Soit {monthlyPrice.toFixed(2)}€ / mois
                </Text>
              )}
              <Text fontSize={14} color={colors.gray700} fontWeight="700">
                Soit {weeklyEquivalent.toFixed(2)}€ / semaine
              </Text>
            </YStack>
          ) : billingPeriod === "weekly" ? (
            <Text fontSize={14} color={colors.gray500}>
              par semaine
            </Text>
          ) : (
            <YStack alignItems="center" gap="$1">
              <Text fontSize={14} color={colors.gray500}>
                par mois
              </Text>
              <Text fontSize={14} color={colors.gray700} fontWeight="700">
                Soit {weeklyEquivalent.toFixed(2)}€ / semaine
              </Text>
            </YStack>
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
            : ctaLabel
              ? ctaLabel
              : popular
              ? "Choisir ce plan"
              : "S'abonner"}
        </Button>
      </BaseCard>
    </YStack>
  );
}
