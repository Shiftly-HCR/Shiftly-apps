"use client";

import { YStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";

interface EmptyStateProps {
  title: string;
  description?: string;
  padding?: string;
}

/**
 * Composant réutilisable pour afficher un état vide
 */
export function EmptyState({
  title,
  description,
  padding = "$8",
}: EmptyStateProps) {
  return (
    <YStack
      padding={padding}
      alignItems="center"
      justifyContent="center"
      gap="$4"
    >
      <Text fontSize={18} color={colors.gray700} textAlign="center">
        {title}
      </Text>
      {description && (
        <Text fontSize={14} color={colors.gray500} textAlign="center">
          {description}
        </Text>
      )}
    </YStack>
  );
}

