"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import { Button, FreelanceCard, colors } from "@shiftly/ui";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiHeadphones } from "react-icons/fi";
import { AppLayout } from "../../../components/AppLayout";
import {
  getPublishedMissions,
  getPublishedFreelances,
  type Mission,
  type FreelanceProfile,
} from "@shiftly/data";
import { useCurrentProfile } from "../../../hooks";

export default function FreelanceMissionsPage() {
  const router = useRouter();
  const { profile, isLoading: isLoadingProfile } = useCurrentProfile();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [recommendedFreelances, setRecommendedFreelances] = useState<
    FreelanceProfile[]
  >([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const isLoading = isLoadingProfile || isLoadingData;

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      const [publishedMissions, freelances] = await Promise.all([
        getPublishedMissions(),
        getPublishedFreelances(),
      ]);

      // Simuler des missions récentes pour le freelance
      // En production, il faudrait une table de candidatures
      setMissions(publishedMissions.slice(0, 3));

      // Prendre les 3 premiers freelances comme recommandations
      setRecommendedFreelances(freelances.slice(0, 3));

      setIsLoadingData(false);
    };

    loadData();
  }, []);

  const getFullName = () => {
    if (!profile) return "Utilisateur";
    const firstName = profile.first_name || "";
    const lastName = profile.last_name || "";
    return `${firstName} ${lastName}`.trim() || "Utilisateur";
  };

  const formatDate = (date?: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getMissionStatus = (
    mission: Mission
  ): "in_progress" | "completed" | "pending" => {
    // Logique simplifiée - en production, utiliser une table de candidatures
    if (mission.status === "closed") return "completed";
    if (mission.status === "published") return "in_progress";
    return "pending";
  };

  const getStatusLabel = (status: "in_progress" | "completed" | "pending") => {
    switch (status) {
      case "in_progress":
        return "En cours";
      case "completed":
        return "Terminée";
      case "pending":
        return "En attente";
    }
  };

  const getStatusColor = (status: "in_progress" | "completed" | "pending") => {
    switch (status) {
      case "in_progress":
        return colors.shiftlyViolet;
      case "completed":
        return colors.gray500;
      case "pending":
        return "#F59E0B";
    }
  };

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
            Chargement...
          </Text>
        </YStack>
      </AppLayout>
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
          <XStack
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap="$4"
          >
            <Text fontSize={32} fontWeight="700" color={colors.gray900}>
              Bienvenue, {getFullName()} 👋
            </Text>
          </XStack>

          <XStack gap="$6" alignItems="flex-start" flexWrap="wrap">
            {/* Colonne gauche */}
            <YStack flex={1} minWidth={400} gap="$6">
              {/* Mes missions récentes */}
              <YStack gap="$4">
                <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                  Mes missions récentes
                </Text>

                {missions.length === 0 ? (
                  <YStack
                    padding="$6"
                    backgroundColor={colors.white}
                    borderRadius={12}
                    borderWidth={1}
                    borderColor={colors.gray200}
                    alignItems="center"
                    gap="$2"
                  >
                    <Text
                      fontSize={16}
                      color={colors.gray700}
                      textAlign="center"
                    >
                      Aucune mission récente
                    </Text>
                    <Text
                      fontSize={14}
                      color={colors.gray500}
                      textAlign="center"
                    >
                      Explorez les missions disponibles sur la page d'accueil
                    </Text>
                  </YStack>
                ) : (
                  <YStack gap="$3">
                    {missions.map((mission) => {
                      const status = getMissionStatus(mission);
                      return (
                        <XStack
                          key={mission.id}
                          padding="$4"
                          backgroundColor={colors.white}
                          borderRadius={12}
                          borderWidth={1}
                          borderColor={colors.gray200}
                          alignItems="center"
                          justifyContent="space-between"
                          cursor="pointer"
                          hoverStyle={{
                            borderColor: colors.shiftlyViolet,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                          }}
                          onPress={() => router.push(`/missions/${mission.id}`)}
                        >
                          <YStack flex={1} gap="$2">
                            <XStack
                              gap="$2"
                              alignItems="center"
                              flexWrap="wrap"
                            >
                              <Text
                                fontSize={16}
                                fontWeight="600"
                                color={colors.gray900}
                              >
                                {mission.title}
                              </Text>
                              <XStack
                                paddingHorizontal="$2"
                                paddingVertical="$1"
                                borderRadius="$2"
                                backgroundColor={getStatusColor(status) + "20"}
                              >
                                <Text
                                  fontSize={12}
                                  fontWeight="600"
                                  color={getStatusColor(status)}
                                >
                                  {getStatusLabel(status)}
                                </Text>
                              </XStack>
                            </XStack>
                            <Text fontSize={14} color={colors.gray500}>
                              Publiée le {formatDate(mission.created_at)}
                            </Text>
                            <Text
                              fontSize={14}
                              color={colors.gray700}
                              fontWeight="500"
                            >
                              {Math.floor(Math.random() * 20) + 5} Candidats
                            </Text>
                          </YStack>
                          <FiArrowRight size={20} color={colors.gray500} />
                        </XStack>
                      );
                    })}
                  </YStack>
                )}
              </YStack>

              {/* Statistiques rapides */}
              <YStack gap="$4">
                <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                  Statistiques rapides
                </Text>
                <XStack gap="$4" flexWrap="wrap">
                  <YStack
                    flex={1}
                    minWidth={180}
                    padding="$4"
                    backgroundColor={colors.white}
                    borderRadius={12}
                    borderWidth={1}
                    borderColor={colors.gray200}
                  >
                    <Text fontSize={14} color={colors.gray700} fontWeight="600">
                      Missions actives
                    </Text>
                    <Text
                      fontSize={32}
                      fontWeight="700"
                      color={colors.gray900}
                      marginTop="$2"
                    >
                      {
                        missions.filter(
                          (m) => getMissionStatus(m) === "in_progress"
                        ).length
                      }
                    </Text>
                  </YStack>

                  <YStack
                    flex={1}
                    minWidth={180}
                    padding="$4"
                    backgroundColor={colors.white}
                    borderRadius={12}
                    borderWidth={1}
                    borderColor={colors.gray200}
                  >
                    <Text fontSize={14} color={colors.gray700} fontWeight="600">
                      Candidatures en attente
                    </Text>
                    <Text
                      fontSize={32}
                      fontWeight="700"
                      color={colors.shiftlyViolet}
                      marginTop="$2"
                    >
                      15
                    </Text>
                  </YStack>

                  <YStack
                    flex={1}
                    minWidth={180}
                    padding="$4"
                    backgroundColor={colors.white}
                    borderRadius={12}
                    borderWidth={1}
                    borderColor={colors.gray200}
                  >
                    <Text fontSize={14} color={colors.gray700} fontWeight="600">
                      Taux de réussite
                    </Text>
                    <Text
                      fontSize={32}
                      fontWeight="700"
                      color={colors.gray900}
                      marginTop="$2"
                    >
                      80%
                    </Text>
                  </YStack>
                </XStack>
              </YStack>
            </YStack>

            {/* Colonne droite */}
            <YStack width={400} flexShrink={0} gap="$6">
              {/* Freelances recommandés */}
              {recommendedFreelances.length > 0 && (
                <YStack gap="$4">
                  <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                    Freelances recommandés
                  </Text>
                  <XStack gap="$3" flexWrap="wrap">
                    {recommendedFreelances.map((freelance) => {
                      const fullName =
                        `${freelance.first_name || ""} ${freelance.last_name || ""}`.trim() ||
                        "Freelance";
                      return (
                        <YStack key={freelance.id} flex={1} minWidth={120}>
                          <FreelanceCard
                            name={fullName}
                            subtitle={freelance.headline || freelance.bio}
                            avatar={freelance.photo_url}
                            rating={freelance.note}
                            isOnline={false}
                            tags={freelance.skills?.slice(0, 2) || []}
                            onPress={() =>
                              router.push(`/profile/${freelance.id}`)
                            }
                            onViewProfile={() =>
                              router.push(`/profile/${freelance.id}`)
                            }
                          />
                        </YStack>
                      );
                    })}
                  </XStack>
                </YStack>
              )}

              {/* Besoin d'aide ? */}
              <YStack
                padding="$6"
                borderRadius={12}
                borderWidth={1}
                borderColor={colors.gray200}
                gap="$4"
                position="relative"
                overflow="hidden"
                style={{
                  background: `linear-gradient(135deg, ${colors.shiftlyViolet} 0%, ${colors.shiftlyGold} 100%)`,
                }}
              >
                {/* Illustration de fond */}
                <YStack
                  position="absolute"
                  right={-20}
                  bottom={-20}
                  opacity={0.2}
                  pointerEvents="none"
                >
                  <FiHeadphones size={120} color={colors.white} />
                </YStack>

                <YStack gap="$2" zIndex={10}>
                  <Text fontSize={20} fontWeight="700" color={colors.white}>
                    Besoin d'aide ?
                  </Text>
                  <Text fontSize={16} color={colors.white} opacity={0.9}>
                    Contactez notre équipe Shiftly
                  </Text>
                  <Text fontSize={14} color={colors.white} opacity={0.8}>
                    Nous sommes là pour vous aider à chaque étape.
                  </Text>
                </YStack>

                <Button
                  variant="secondary"
                  size="md"
                  onPress={() => router.push("/contact")}
                  backgroundColor={colors.white}
                  color={colors.shiftlyViolet}
                  hoverStyle={{
                    backgroundColor: colors.gray100,
                  }}
                >
                  Nous contacter
                </Button>
              </YStack>
            </YStack>
          </XStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
