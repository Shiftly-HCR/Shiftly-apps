"use client";

import { useAuthRedirect } from "@/hooks";
import { colors } from "@shiftly/ui";
import { YStack, Text } from "tamagui";

export default function Home() {
  // Utiliser le hook pour gérer la redirection automatique
  useAuthRedirect();

  // Affichage temporaire pendant la redirection
  return (
    <YStack
      flex={1}
      backgroundColor={colors.backgroundLight}
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <Text fontSize={16} color="#6B7280">
        Redirection...
      </Text>
    </YStack>
  );
}
