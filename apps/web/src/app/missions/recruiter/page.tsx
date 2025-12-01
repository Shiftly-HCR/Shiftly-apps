"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import { useRouter } from "next/navigation";
import { MissionCard, CreateMissionCard, colors } from "@shiftly/ui";
import { AppLayout } from "@/components";
import { useRecruiterMissions } from "@/hooks";

export default function RecruiterMissionsPage() {
  const router = useRouter();
  const { missions, isLoading } = useRecruiterMissions();

  const handleCreateMission = () => {
    router.push("/missions/create");
  };

  const handleMissionClick = (missionId: string) => {
    router.push(`/missions/${missionId}`);
  };

  const handleEditMission = (missionId: string) => {
    router.push(`/missions/${missionId}/edit`);
  };

  const handleManageCandidates = (missionId: string) => {
    router.push(`/missions/${missionId}/candidates`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$4"
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
          <YStack gap="$3">
            <Text fontSize={32} fontWeight="700" color={colors.gray900}>
              Mes missions
            </Text>
            <Text fontSize={16} color={colors.gray700}>
              Gérez vos missions et créez-en de nouvelles
            </Text>
          </YStack>

          {/* Statistiques rapides */}
          <XStack gap="$4" flexWrap="wrap">
            <YStack
              flex={1}
              minWidth={200}
              padding="$4"
              backgroundColor={colors.white}
              borderRadius={12}
              borderWidth={1}
              borderColor={colors.gray200}
            >
              <Text fontSize={14} color={colors.gray700} fontWeight="600">
                Total des missions
              </Text>
              <Text fontSize={32} fontWeight="700" color={colors.gray900}>
                {missions.length}
              </Text>
            </YStack>

            <YStack
              flex={1}
              minWidth={200}
              padding="$4"
              backgroundColor={colors.white}
              borderRadius={12}
              borderWidth={1}
              borderColor={colors.gray200}
            >
              <Text fontSize={14} color={colors.gray700} fontWeight="600">
                Missions publiées
              </Text>
              <Text fontSize={32} fontWeight="700" color={colors.shiftlyViolet}>
                {missions.filter((m) => m.status === "published").length}
              </Text>
            </YStack>

            <YStack
              flex={1}
              minWidth={200}
              padding="$4"
              backgroundColor={colors.white}
              borderRadius={12}
              borderWidth={1}
              borderColor={colors.gray200}
            >
              <Text fontSize={14} color={colors.gray700} fontWeight="600">
                Brouillons
              </Text>
              <Text fontSize={32} fontWeight="700" color={colors.gray500}>
                {missions.filter((m) => m.status === "draft").length}
              </Text>
            </YStack>
          </XStack>

          {/* Grille de missions */}
          <YStack gap="$4">
            <Text fontSize={20} fontWeight="700" color={colors.gray900}>
              Toutes les missions
            </Text>

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
                    onManageCandidates={() => handleManageCandidates(mission.id)}
                  />

                  {/* Badge de statut */}
                  <YStack
                    position="absolute"
                    top={12}
                    right={12}
                    paddingHorizontal="$3"
                    paddingVertical="$1.5"
                    borderRadius={20}
                    backgroundColor={
                      mission.status === "published"
                        ? "#10B981"
                        : mission.status === "draft"
                          ? colors.gray500
                          : mission.status === "closed"
                            ? "#EF4444"
                            : colors.gray300
                    }
                  >
                    <Text fontSize={12} color={colors.white} fontWeight="600">
                      {mission.status === "published"
                        ? "Publié"
                        : mission.status === "draft"
                          ? "Brouillon"
                          : mission.status === "closed"
                            ? "Fermé"
                            : "Annulé"}
                    </Text>
                  </YStack>
                </YStack>
              ))}
            </XStack>

            {/* Message si aucune mission */}
            {missions.length === 0 && (
              <YStack
                padding="$8"
                alignItems="center"
                justifyContent="center"
                gap="$4"
              >
                <Text fontSize={18} color={colors.gray700} textAlign="center">
                  Vous n'avez pas encore créé de mission
                </Text>
                <Text fontSize={14} color={colors.gray500} textAlign="center">
                  Commencez par créer votre première mission en cliquant sur la
                  carte ci-dessus
                </Text>
              </YStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
