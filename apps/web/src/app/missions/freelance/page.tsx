"use client";

export const dynamic = "force-dynamic";

import { YStack, XStack, ScrollView, Text } from "tamagui";
import { Button, MissionCard } from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiHeadphones } from "react-icons/fi";
import {
  AppLayout,
  PageLoading,
  PageHeader,
  PageSection,
  StatisticsCard,
  EmptyState,
  HelpCard,
} from "@/components";
import { useFreelanceMissionsPage } from "@/hooks";
import { colors } from "@shiftly/ui";

export default function FreelanceMissionsPage() {
  const router = useRouter();
  const {
    profile,
    missions,
    recommendedMissions,
    isLoading,
    getFullName,
    formatDate,
    getMissionStatus,
    getStatusLabel,
    getStatusColor,
  } = useFreelanceMissionsPage();

  if (isLoading) {
    return <PageLoading />;
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
          <PageHeader title={`Bienvenue, ${getFullName()} 👋`} />

          <XStack gap="$6" alignItems="flex-start" flexWrap="wrap">
            {/* Colonne gauche */}
            <YStack flex={1} minWidth={400} gap="$6">
              {/* Mes missions récentes */}
              <PageSection title="Mes missions récentes">
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
                    <EmptyState
                      title="Aucune mission récente"
                      description="Explorez les missions disponibles sur la page d'accueil"
                      padding="$0"
                    />
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
              </PageSection>

              {/* Statistiques rapides */}
              <PageSection title="Statistiques rapides">
                {profile?.id && (
                  <Text fontSize={14} color={colors.gray600} marginBottom="$2">
                    ID: {profile.id}
                  </Text>
                )}

                <XStack gap="$4" flexWrap="wrap">
                  <StatisticsCard
                    label="Missions actives"
                    value={
                      missions.filter(
                        (m) => getMissionStatus(m) === "in_progress",
                      ).length
                    }
                    minWidth={180}
                  />
                  <StatisticsCard
                    label="Candidatures en attente"
                    value={15}
                    valueColor={colors.shiftlyViolet}
                    minWidth={180}
                  />
                  <StatisticsCard
                    label="Taux de réussite"
                    value="80%"
                    minWidth={180}
                  />
                </XStack>
              </PageSection>

              <PageSection title="Suivi de missions">
                <XStack>
                  <Text> Mission en cours</Text>
                </XStack>
              </PageSection>
            </YStack>

            {/* Colonne droite */}
            <YStack width={400} flexShrink={0} gap="$6">
              {/* Missions recommandées */}
              <PageSection title="Missions recommandées">
                {recommendedMissions.length > 0 ? (
                  <YStack gap="$3">
                    {recommendedMissions.map((mission) => {
                      const formatDateRange = () => {
                        if (!mission.start_date && !mission.end_date) {
                          return "";
                        }

                        const formatOptions: Intl.DateTimeFormatOptions = {
                          day: "numeric",
                          month: "short",
                        };

                        if (mission.start_date && mission.end_date) {
                          const start = new Date(
                            mission.start_date,
                          ).toLocaleDateString("fr-FR", formatOptions);
                          const end = new Date(
                            mission.end_date,
                          ).toLocaleDateString("fr-FR", formatOptions);
                          return `Du ${start} au ${end}`;
                        }
                        if (mission.start_date) {
                          const start = new Date(
                            mission.start_date,
                          ).toLocaleDateString("fr-FR", formatOptions);
                          return `Le ${start}`;
                        }
                        return "";
                      };

                      const formatTimeRange = () => {
                        if (mission.start_time && mission.end_time) {
                          return `${mission.start_time} - ${mission.end_time}`;
                        }
                        if (mission.start_time) {
                          return mission.start_time;
                        }
                        return "";
                      };

                      return (
                        <MissionCard
                          key={mission.id}
                          title={mission.title}
                          date={formatDateRange()}
                          time={formatTimeRange()}
                          price={
                            mission.hourly_rate
                              ? `${mission.hourly_rate}€`
                              : "À négocier"
                          }
                          priceUnit="/ heure"
                          image={mission.image_url}
                          isPremium={mission.is_urgent}
                          onPress={() => router.push(`/missions/${mission.id}`)}
                          showButton={true}
                          buttonText="Voir la mission"
                        />
                      );
                    })}
                  </YStack>
                ) : (
                  <EmptyState
                    title="Aucune mission recommandée pour le moment"
                    padding="$6"
                  />
                )}
              </PageSection>

              {/* Besoin d'aide ? */}
              <HelpCard
                title="Besoin d'aide ?"
                subtitle="Contactez notre équipe Shiftly"
                description="Nous sommes là pour vous aider à chaque étape."
                buttonText="Nous contacter"
                onButtonPress={() => router.push("/contact")}
                backgroundIcon={
                  <FiHeadphones size={120} color={colors.white} />
                }
              />
            </YStack>
          </XStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
