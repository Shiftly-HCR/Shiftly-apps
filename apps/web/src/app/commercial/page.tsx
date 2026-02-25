"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import {
  AppLayout,
  CommercialRevenueDashboard,
  EstablishmentCodeInput,
  MyCommercialEstablishments,
} from "@/components";
import { useRequireRole, useResponsive } from "@/hooks";
import { colors } from "@shiftly/ui";
import { useState } from "react";

export default function CommercialDashboardPage() {
  const { isAuthorized, isLoading } = useRequireRole("commercial");
  const { isMobile } = useResponsive();
  const [refreshKey, setRefreshKey] = useState(0);

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
          padding={isMobile ? "$4" : "$6"}
          gap="$6"
        >
          {/* En-tête */}
          <YStack gap="$2">
            <Text fontSize={32} fontWeight="700" color={colors.gray900}>
              Dashboard commercial
            </Text>
            <Text fontSize={16} color={colors.gray500}>
              Gérez vos établissements et vos missions
            </Text>
          </YStack>

          {/* Dashboard de rémunération */}
          <CommercialRevenueDashboard />

          {/* Layout 2 colonnes */}
          <XStack
            gap="$4"
            alignItems="flex-start"
            flexWrap="wrap"
            flexDirection={isMobile ? "column" : "row"}
          >
            {/* COLONNE GAUCHE - Contenu principal */}
            <YStack
              flex={isMobile ? undefined : 1}
              gap="$6"
              minWidth={isMobile ? undefined : 300}
              width={isMobile ? "100%" : undefined}
            >
              {/* Section mes établissements */}
              <YStack
                backgroundColor="white"
                borderRadius="$4"
                padding="$6"
                borderWidth={1}
                borderColor={colors.gray200}
                gap="$4"
              >
                <Text fontSize={20} fontWeight="600" color={colors.gray900}>
                  Mes établissements
                </Text>
                <Text fontSize={14} color={colors.gray500} marginBottom="$2">
                  Établissements auxquels vous êtes rattaché
                </Text>
                <MyCommercialEstablishments key={`my-${refreshKey}`} />
              </YStack>
            </YStack>

            {/* COLONNE DROITE - Sidebar */}
            <YStack
              width={isMobile ? "100%" : 320}
              gap="$4"
              flexShrink={isMobile ? undefined : 0}
            >
              <EstablishmentCodeInput
                onAttachmentSuccess={() => {
                  setRefreshKey((prev: number) => prev + 1);
                }}
              />
            </YStack>
          </XStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
