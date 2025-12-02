"use client";

import { YStack, Text, ScrollView } from "tamagui";
import { AppLayout } from "@/components";
import { useRequireRole } from "@/hooks";
import { colors } from "@shiftly/ui";

export default function CommercialDashboardPage() {
  const { isAuthorized, isLoading } = useRequireRole("commercial");

  if (isLoading || !isAuthorized) {
    return (
      <YStack
        flex={1}
        backgroundColor="#F9FAFB"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Text fontSize={16} color="#6B7280">
          Chargement...
        </Text>
      </YStack>
    );
  }

  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack
          maxWidth={1400}
          width="100%"
          alignSelf="center"
          padding="$6"
          gap="$6"
        >
          {/* En-tête */}
          <YStack gap="$2">
            <Text fontSize={32} fontWeight="700" color={colors.gray900}>
              Dashboard commercial
            </Text>
            <Text fontSize={16} color={colors.gray600}>
              Gérez vos établissements et vos missions
            </Text>
          </YStack>

          {/* Section établissements */}
          <YStack
            backgroundColor="white"
            borderRadius="$4"
            padding="$6"
            borderWidth={1}
            borderColor={colors.gray200}
            gap="$4"
          >
            <Text fontSize={20} fontWeight="600" color={colors.gray900}>
              Établissements
            </Text>
            <Text fontSize={14} color={colors.gray600}>
              La liste des établissements rattachés sera affichée ici.
            </Text>
            {/* TODO: Afficher la liste des établissements */}
          </YStack>

          {/* Section code établissement */}
          <YStack
            backgroundColor="white"
            borderRadius="$4"
            padding="$6"
            borderWidth={1}
            borderColor={colors.gray200}
            gap="$4"
          >
            <Text fontSize={20} fontWeight="600" color={colors.gray900}>
              Entrer un code établissement
            </Text>
            <Text fontSize={14} color={colors.gray600}>
              Fonctionnalité à venir : permettez-vous de vous connecter à un
              établissement via un code secret.
            </Text>
            {/* TODO: Implémenter le champ de saisie du code */}
          </YStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}

