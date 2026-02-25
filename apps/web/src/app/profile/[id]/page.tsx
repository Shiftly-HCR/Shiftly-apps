"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import { colors } from "@shiftly/ui";
import {
  AppLayout,
  FreelanceProfileHeader,
  FreelanceProfileTabs,
  FreelanceProfileTabContent,
  FreelanceProfileSidebar,
  PageLoading,
} from "@/components";
import { useFreelanceProfilePage, useResponsive } from "@/hooks";

export default function FreelanceProfilePage() {
  const { isMobile } = useResponsive();
  const {
    freelanceId,
    profile,
    experiences,
    educations,
    activeTab,
    setActiveTab,
    isLoading,
    isFetching,
    profileError,
  } = useFreelanceProfilePage();

  // Afficher le loading seulement si on charge pour la première fois
  if (isLoading) {
    return <PageLoading />;
  }

  // Si on a une erreur ou si le profil n'existe pas après le chargement
  if (profileError || (!profile && !isFetching)) {
    return (
      <AppLayout>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$6"
        >
          <Text fontSize={18} color={colors.gray700}>
            {profileError ? `Erreur: ${profileError.message}` : "Profil introuvable"}
          </Text>
        </YStack>
      </AppLayout>
    );
  }

  // Si on est en train de recharger mais qu'on a déjà des données, les afficher
  if (!profile) {
    return <PageLoading />;
  }

  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack
          maxWidth={1400}
          width="100%"
          alignSelf="center"
          padding={isMobile ? "$4" : "$6"}
        >
          <XStack
            gap="$6"
            alignItems="flex-start"
            flexDirection={isMobile ? "column" : "row"}
          >
            {/* Contenu principal */}
            <YStack
              flex={isMobile ? undefined : 1}
              gap="$6"
              width={isMobile ? "100%" : undefined}
            >
              {/* En-tête du profil */}
              <FreelanceProfileHeader profile={profile} />

              {/* Onglets de navigation */}
              <FreelanceProfileTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              {/* Contenu des onglets */}
              <FreelanceProfileTabContent
                activeTab={activeTab}
                profile={profile}
                experiences={experiences}
                educations={educations}
              />
            </YStack>

            {/* Sidebar droite */}
            <FreelanceProfileSidebar
              freelanceId={freelanceId}
              profile={profile}
              isMobile={isMobile}
            />
          </XStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
