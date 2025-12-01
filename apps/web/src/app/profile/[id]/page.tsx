"use client";

import { useState } from "react";
import { YStack, XStack, Text, ScrollView } from "tamagui";
import { Button, Badge, colors } from "@shiftly/ui";
import { useRouter, useParams } from "next/navigation";
import { AppLayout, FreelanceExperiences, FreelanceEducations } from "@/components";
import { FiCheck, FiMessageCircle, FiBookmark } from "react-icons/fi";
import {
  useCachedProfile,
  useCachedFreelanceData,
  useCurrentProfile,
} from "@/hooks";
import { navigateToMessaging } from "@/utils/chatService";

type TabType = "overview" | "availability" | "reviews" | "documents";

export default function FreelanceProfilePage() {
  const router = useRouter();
  const params = useParams();
  const freelanceId = params?.id as string;

  const { profile, isLoading: isLoadingProfile } =
    useCachedProfile(freelanceId);
  const {
    experiences,
    educations,
    isLoading: isLoadingExperiences,
  } = useCachedFreelanceData(freelanceId);
  const { profile: currentProfile } = useCurrentProfile();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const isLoading = isLoadingProfile || isLoadingExperiences;

  if (isLoading) {
    return (
      <AppLayout>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$6"
        >
          <Text fontSize={16} color={colors.gray700}>
            Chargement du profil...
          </Text>
        </YStack>
      </AppLayout>
    );
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

  const getFullName = () => {
    const firstName = profile.first_name || "";
    const lastName = profile.last_name || "";
    return `${firstName} ${lastName}`.trim() || "Freelance";
  };

  const tabs = [
    { id: "overview" as TabType, label: "Aperçu" },
    { id: "availability" as TabType, label: "Disponibilités" },
    { id: "reviews" as TabType, label: "Avis" },
    { id: "documents" as TabType, label: "Documents" },
  ];

  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack maxWidth={1400} width="100%" alignSelf="center" padding="$6">
          <XStack gap="$6" alignItems="flex-start">
            {/* Contenu principal */}
            <YStack flex={1} gap="$6">
              {/* En-tête du profil */}
              <XStack gap="$4" alignItems="flex-start">
                {/* Photo de profil */}
                <YStack
                  width={120}
                  height={120}
                  borderRadius={60}
                  backgroundColor={colors.shiftlyViolet}
                  alignItems="center"
                  justifyContent="center"
                  overflow="hidden"
                  flexShrink={0}
                >
                  {profile.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt={getFullName()}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Text color={colors.white} fontSize={48} fontWeight="600">
                      {getFullName().charAt(0).toUpperCase()}
                    </Text>
                  )}
                </YStack>

                {/* Informations principales */}
                <YStack flex={1} gap="$2">
                  <XStack gap="$3" alignItems="center" flexWrap="wrap">
                    <Text fontSize={32} fontWeight="700" color={colors.gray900}>
                      {getFullName()}
                    </Text>
                    {profile.note && (
                      <XStack alignItems="center" gap="$1">
                        <Text fontSize={16} color={colors.shiftlyGold}>
                          ⭐
                        </Text>
                        <Text
                          fontSize={16}
                          fontWeight="600"
                          color={colors.gray700}
                        >
                          {profile.note.toFixed(1)} (12 avis)
                        </Text>
                      </XStack>
                    )}
                  </XStack>

                  <Text fontSize={18} color={colors.gray700} fontWeight="500">
                    {profile.headline || "Freelance"}
                  </Text>

                  {/* Badges */}
                  <XStack
                    gap="$2"
                    alignItems="center"
                    flexWrap="wrap"
                    marginTop="$2"
                  >
                    <XStack
                      paddingHorizontal="$3"
                      paddingVertical="$1.5"
                      backgroundColor={colors.white}
                      borderRadius="$3"
                      borderWidth={1}
                      borderColor={colors.gray200}
                      gap="$2"
                      alignItems="center"
                    >
                      <FiCheck size={16} color={colors.shiftlyViolet} />
                      <Text
                        fontSize={13}
                        color={colors.gray700}
                        fontWeight="500"
                      >
                        Profil vérifié
                      </Text>
                    </XStack>
                    <XStack
                      paddingHorizontal="$3"
                      paddingVertical="$1.5"
                      backgroundColor={colors.shiftlyViolet + "20"}
                      borderRadius="$3"
                      borderWidth={1}
                      borderColor={colors.shiftlyViolet}
                    >
                      <Text
                        fontSize={13}
                        color={colors.shiftlyViolet}
                        fontWeight="600"
                      >
                        Top Freelance
                      </Text>
                    </XStack>
                  </XStack>
                </YStack>
              </XStack>

              {/* Onglets de navigation */}
              <XStack
                borderBottomWidth={1}
                borderBottomColor={colors.gray200}
                gap="$6"
                marginTop="$4"
              >
                {tabs.map((tab) => (
                  <YStack
                    key={tab.id}
                    paddingBottom="$3"
                    borderBottomWidth={activeTab === tab.id ? 2 : 0}
                    borderBottomColor={
                      activeTab === tab.id
                        ? colors.shiftlyViolet
                        : "transparent"
                    }
                    marginBottom={activeTab === tab.id ? -1 : 0}
                    cursor="pointer"
                    onPress={() => setActiveTab(tab.id)}
                  >
                    <Text
                      fontSize={16}
                      fontWeight={activeTab === tab.id ? "600" : "400"}
                      color={
                        activeTab === tab.id
                          ? colors.shiftlyViolet
                          : colors.gray700
                      }
                    >
                      {tab.label}
                    </Text>
                  </YStack>
                ))}
              </XStack>

              {/* Contenu des onglets */}
              {activeTab === "overview" && (
                <YStack gap="$6">
                  {/* À propos */}
                  <YStack gap="$3">
                    <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                      À propos
                    </Text>
                    <Text fontSize={16} color={colors.gray700} lineHeight={24}>
                      {profile.summary ||
                        profile.bio ||
                        "Aucune description disponible."}
                    </Text>
                  </YStack>

                  {/* Compétences */}
                  {profile.skills && profile.skills.length > 0 && (
                    <YStack gap="$3">
                      <Text
                        fontSize={20}
                        fontWeight="700"
                        color={colors.gray900}
                      >
                        Compétences
                      </Text>
                      <XStack gap="$2" flexWrap="wrap">
                        {profile.skills.map((skill, index) => (
                          <XStack
                            key={index}
                            paddingHorizontal="$3"
                            paddingVertical="$2"
                            backgroundColor={colors.white}
                            borderRadius="$3"
                            borderWidth={1}
                            borderColor={colors.gray200}
                          >
                            <Text
                              fontSize={14}
                              color={colors.gray700}
                              fontWeight="500"
                            >
                              {skill}
                            </Text>
                          </XStack>
                        ))}
                      </XStack>
                    </YStack>
                  )}

                  {/* Expériences */}
                  <FreelanceExperiences experiences={experiences} />

                  {/* Formations */}
                  <FreelanceEducations educations={educations || []} />
                </YStack>
              )}

              {activeTab === "availability" && (
                <YStack
                  gap="$4"
                  padding="$4"
                  backgroundColor={colors.white}
                  borderRadius={12}
                >
                  <Text fontSize={16} color={colors.gray700}>
                    Les disponibilités seront affichées ici.
                  </Text>
                </YStack>
              )}

              {activeTab === "reviews" && (
                <YStack
                  gap="$4"
                  padding="$4"
                  backgroundColor={colors.white}
                  borderRadius={12}
                >
                  <Text fontSize={16} color={colors.gray700}>
                    Les avis seront affichés ici.
                  </Text>
                </YStack>
              )}

              {activeTab === "documents" && (
                <YStack
                  gap="$4"
                  padding="$4"
                  backgroundColor={colors.white}
                  borderRadius={12}
                >
                  <Text fontSize={16} color={colors.gray700}>
                    Les documents seront affichés ici.
                  </Text>
                </YStack>
              )}
            </YStack>

            {/* Sidebar droite */}
            <YStack
              width={300}
              flexShrink={0}
              gap="$3"
              padding="$4"
              backgroundColor={colors.white}
              borderRadius={12}
              borderWidth={1}
              borderColor={colors.gray200}
              position="sticky"
              top={20}
            >
              <Button
                variant="primary"
                size="md"
                onPress={() =>
                  router.push(`/missions/create?freelance=${freelanceId}`)
                }
                width="100%"
              >
                Inviter sur une mission
              </Button>

              <Button
                variant="secondary"
                size="md"
                onPress={() => {
                  // TODO: Implémenter la sauvegarde du profil
                  console.log("Sauvegarder le profil");
                }}
                width="100%"
              >
                <XStack gap="$2" alignItems="center" justifyContent="center">
                  <FiBookmark size={18} />
                  <Text>Sauvegarder le profil</Text>
                </XStack>
              </Button>

              <Button
                variant="secondary"
                size="md"
                onPress={() => {
                  navigateToMessaging(router);
                }}
                width="100%"
              >
                <XStack gap="$2" alignItems="center" justifyContent="center">
                  <FiMessageCircle size={18} />
                  <Text>Démarrer un chat</Text>
                </XStack>
              </Button>
            </YStack>
          </XStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
