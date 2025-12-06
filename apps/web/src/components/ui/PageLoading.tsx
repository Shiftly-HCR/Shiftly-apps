"use client";

import { YStack, Text } from "tamagui";
import { AppLayout } from "@/components";
import { colors } from "@shiftly/ui";

interface PageLoadingProps {
  message?: string;
}

/**
 * Composant réutilisable pour afficher un état de chargement dans une page
 * Wrappe automatiquement le contenu dans AppLayout
 */
export function PageLoading({ message = "Chargement..." }: PageLoadingProps) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
      <Text fontSize={16} color={colors.gray700}>
        {message}
      </Text>
    </YStack>
  );
}
