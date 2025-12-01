"use client";

import { YStack, XStack, ScrollView } from "tamagui";
import { MissionCard, CreateMissionCard } from "@shiftly/ui";
import {
  AppLayout,
  PageLoading,
  PageHeader,
  StatisticsCard,
  PageSection,
  EmptyState,
  StatusBadge,
} from "@/components";
import { useRecruiterMissionsPage } from "@/hooks";
import { colors } from "@shiftly/ui";

export default function RecruiterMissionsPage() {
  const {
    missions,
    isLoading,
    handleCreateMission,
    handleMissionClick,
    handleEditMission,
    handleManageCandidates,
  } = useRecruiterMissionsPage();

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
          <PageHeader
            title="Mes missions"
            description="Gérez vos missions et créez-en de nouvelles"
          />

          {/* Statistiques rapides */}
          <XStack gap="$4" flexWrap="wrap">
            <StatisticsCard
              label="Total des missions"
              value={missions.length}
            />
            <StatisticsCard
              label="Missions publiées"
              value={missions.filter((m) => m.status === "published").length}
              valueColor={colors.shiftlyViolet}
            />
            <StatisticsCard
              label="Brouillons"
              value={missions.filter((m) => m.status === "draft").length}
              valueColor={colors.gray500}
            />
          </XStack>

          {/* Grille de missions */}
          <PageSection title="Toutes les missions">
            <XStack flexWrap="wrap" gap="$4" justifyContent="flex-start">
              {/* Carte de création */}
              <YStack width="calc(33.333% - 12px)" minWidth={300}>
                <CreateMissionCard onPress={handleCreateMission} />
              </YStack>

              {/* Missions existantes */}
              {missions.map((mission) => (
                <YStack
                  key={mission.id}
                  width="calc(33.333% - 12px)"
                  minWidth={300}
                  position="relative"
                >
                  <MissionCard
                    title={mission.title}
                    date={
                      mission.start_date && mission.end_date
                        ? `Du ${new Date(mission.start_date).toLocaleDateString("fr-FR")} au ${new Date(mission.end_date).toLocaleDateString("fr-FR")}`
                        : "Dates non définies"
                    }
                    price={
                      mission.hourly_rate
                        ? `${mission.hourly_rate}€`
                        : "Non défini"
                    }
                    priceUnit="/ heure"
                    image={mission.image_url}
                    missionId={mission.id}
                    onPress={() => handleMissionClick(mission.id)}
                    onEdit={() => handleEditMission(mission.id)}
                    onManageCandidates={() =>
                      handleManageCandidates(mission.id)
                    }
                  />

                  {/* Badge de statut */}
                  <StatusBadge
                    label={
                      mission.status === "published"
                        ? "Publié"
                        : mission.status === "draft"
                          ? "Brouillon"
                          : mission.status === "closed"
                            ? "Fermé"
                            : "Annulé"
                    }
                    backgroundColor={
                      mission.status === "published"
                        ? "#10B981"
                        : mission.status === "draft"
                          ? colors.gray500
                          : mission.status === "closed"
                            ? "#EF4444"
                            : colors.gray500
                    }
                  />
                </YStack>
              ))}
            </XStack>

            {/* Message si aucune mission */}
            {missions.length === 0 && (
              <EmptyState
                title="Vous n'avez pas encore créé de mission"
                description="Commencez par créer votre première mission en cliquant sur la carte ci-dessus"
              />
            )}
          </PageSection>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
