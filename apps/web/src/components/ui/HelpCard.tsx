"use client";

import { YStack, Text } from "tamagui";
import { Button, colors } from "@shiftly/ui";
import type { ReactNode } from "react";

interface HelpCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  buttonText: string;
  onButtonPress: () => void;
  backgroundIcon?: ReactNode;
  gradientColors?: [string, string];
}

/**
 * Composant réutilisable pour afficher une carte d'aide avec gradient
 */
export function HelpCard({
  title,
  subtitle,
  description,
  buttonText,
  onButtonPress,
  backgroundIcon,
  gradientColors = [colors.shiftlyViolet, colors.shiftlyGold],
}: HelpCardProps) {
  return (
    <YStack
      padding="$6"
      borderRadius={12}
      borderWidth={1}
      borderColor={colors.gray200}
      gap="$4"
      position="relative"
      overflow="hidden"
      style={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
      }}
    >
      {backgroundIcon && (
        <YStack
          position="absolute"
          right={-20}
          bottom={-20}
          opacity={0.2}
          pointerEvents="none"
        >
          {backgroundIcon}
        </YStack>
      )}

      <YStack gap="$2" zIndex={10}>
        <Text fontSize={20} fontWeight="700" color={colors.white}>
          {title}
        </Text>
        {subtitle && (
          <Text fontSize={16} color={colors.white} opacity={0.9}>
            {subtitle}
          </Text>
        )}
        {description && (
          <Text fontSize={14} color={colors.white} opacity={0.8}>
            {description}
          </Text>
        )}
      </YStack>

      <Button
        variant="secondary"
        size="md"
        onPress={onButtonPress}
        backgroundColor={colors.white}
        color={colors.shiftlyViolet}
        hoverStyle={{
          backgroundColor: colors.gray100,
        }}
      >
        {buttonText}
      </Button>
    </YStack>
  );
}

