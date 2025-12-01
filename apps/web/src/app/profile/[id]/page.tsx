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
import { useFreelanceProfilePage } from "@/hooks";

export default function FreelanceProfilePage() {
  const {
    freelanceId,
    profile,
    experiences,
    educations,
    activeTab,
    setActiveTab,
    isLoading,
  } = useFreelanceProfilePage();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!profile) {
    return (
      <AppLayout>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$6"
        >
          <Text fontSize={18} color={colors.gray700}>
            Profil introuvable
          </Text>
        </YStack>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack maxWidth={1400} width="100%" alignSelf="center" padding="$6">
          <XStack gap="$6" alignItems="flex-start">
            {/* Contenu principal */}
            <YStack flex={1} gap="$6">
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
            <FreelanceProfileSidebar freelanceId={freelanceId} />
          </XStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
