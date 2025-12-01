"use client";

import { YStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";

interface StatisticsCardProps {
  label: string;
  value: string | number;
  valueColor?: string;
  flex?: number;
  minWidth?: number;
}

/**
 * Composant réutilisable pour afficher des statistiques
 */
export function StatisticsCard({
  label,
  value,
  valueColor = colors.gray900,
  flex = 1,
  minWidth = 200,
}: StatisticsCardProps) {
  return (
    <YStack
      flex={flex}
      minWidth={minWidth}
      padding="$4"
      backgroundColor={colors.white}
      borderRadius={12}
      borderWidth={1}
      borderColor={colors.gray200}
    >
      <Text fontSize={14} color={colors.gray700} fontWeight="600">
        {label}
      </Text>
      <Text
        fontSize={32}
        fontWeight="700"
        color={valueColor}
        marginTop="$2"
      >
        {value}
      </Text>
    </YStack>
  );
}

