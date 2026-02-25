"use client";

import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { LucideIcon } from "lucide-react";
import { useResponsive } from "@/hooks";

interface MetricCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBackgroundColor: string;
  label: string;
  value: string | number;
  subtitle?: string;
}

/**
 * Composant réutilisable pour afficher une carte de métrique
 */
export function MetricCard({
  icon: Icon,
  iconColor,
  iconBackgroundColor,
  label,
  value,
  subtitle,
}: MetricCardProps) {
  const { isMobile } = useResponsive();

  return (
    <YStack
      flex={isMobile ? undefined : 1}
      width={isMobile ? "100%" : undefined}
      minWidth={isMobile ? undefined : 280}
      backgroundColor="white"
      borderRadius="$4"
      padding="$5"
      borderWidth={1}
      borderColor={colors.gray200}
      gap="$3"
    >
      <XStack alignItems="center" gap="$2" marginBottom="$2">
        <YStack
          width={40}
          height={40}
          borderRadius={20}
          backgroundColor={iconBackgroundColor}
          alignItems="center"
          justifyContent="center"
        >
          <Icon size={20} color={iconColor} />
        </YStack>
        <Text fontSize={14} color={colors.gray500} fontWeight="500">
          {label}
        </Text>
      </XStack>
      <Text fontSize={32} fontWeight="700" color={colors.gray900}>
        {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
      </Text>
      {subtitle && (
        <Text fontSize={12} color={colors.gray500}>
          {subtitle}
        </Text>
      )}
    </YStack>
  );
}

