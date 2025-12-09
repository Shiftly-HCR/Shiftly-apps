"use client";

import type { ReactNode } from "react";
import { YStack, XStack, Text } from "tamagui";
import { Button, BaseCard, colors } from "@shiftly/ui";
import { FiCheck } from "react-icons/fi";

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
}: SubscriptionCardProps) {
  return (
    <YStack
      flex={1}
      minWidth={320}
      maxWidth={400}
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
        <YStack alignItems="center" gap="$1">
          <XStack alignItems="baseline" gap="$1">
            <Text fontSize={48} fontWeight="700" color={colors.gray900}>
              {price}€
            </Text>
            <Text fontSize={18} color={colors.gray700}>
              TTC
            </Text>
          </XStack>
          <Text fontSize={14} color={colors.gray500}>
            par mois
          </Text>
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
