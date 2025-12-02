"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import { useRouter } from "next/navigation";
import { Button } from "@shiftly/ui";
import {
  AppLayout,
  PageLoading,
  MissionDetailHeader,
  MissionDetailLocationHeader,
  MissionDetailImage,
  MissionDetailDescription,
  MissionDetailSchedule,
  MissionDetailSkills,
  MissionDetailLocation,
  MissionDetailSidebar,
  MissionApplicationsSection,
  MissionChatSection,
} from "@/components";
import { useMissionDetailPage } from "@/hooks";

export default function MissionDetailPage() {
  const router = useRouter();
  const {
    missionId,
    mission,
    isLoading,
    profile,
    isRecruiter,
    isMissionOwner,
    applications,
    isLoadingApplications,
    isUpdatingStatus,
    freelanceApplication,
    isFreelanceAccepted,
    showSuccessMessage,
    selectedFreelanceId,
    setSelectedFreelanceId,
    chatFreelanceId,
    canFreelanceChat,
    chat,
    apply,
    isApplying,
    applyError,
    applySuccess,
    hasApplied,
    isCheckingApplication,
    updateStatus,
    refetchApplications,
    handleApply,
    formatDateShort,
  } = useMissionDetailPage();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!mission) {
    return (
      <AppLayout>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$6"
          gap="$4"
        >
          <Text fontSize={20} fontWeight="700" color="#000">
            Mission introuvable
          </Text>
          <Button variant="primary" onPress={() => router.push("/home")}>
            Retour à l'accueil
          </Button>
        </YStack>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ScrollView backgroundColor="#f5f5f5">
        <YStack
          padding="$6"
          maxWidth={1400}
          marginHorizontal="auto"
          width="100%"
        >
          <MissionDetailHeader mission={mission} />
          <MissionDetailLocationHeader mission={mission} />

          {/* Layout 2 colonnes */}
          <XStack
            gap="$4"
            alignItems="flex-start"
            $sm={{ flexDirection: "column" }}
          >
            {/* COLONNE GAUCHE */}
            <YStack flex={1} gap="$4" minWidth={300} $sm={{ width: "100%" }}>
              <MissionDetailImage mission={mission} />
              <MissionDetailDescription mission={mission} />
              <MissionDetailSchedule
                mission={mission}
                formatDateShort={formatDateShort}
              />
              <MissionDetailSkills mission={mission} />
              <MissionDetailLocation mission={mission} />

              {/* Section Candidatures (pour les recruteurs) */}
              {isRecruiter && isMissionOwner && (
                <MissionApplicationsSection
                  applications={applications}
                  isLoadingApplications={isLoadingApplications}
                  isUpdatingStatus={isUpdatingStatus}
                  onRefresh={refetchApplications}
                  onStatusChange={async (applicationId, newStatus) => {
                    const result = await updateStatus(applicationId, newStatus);
                    if (result.success) {
                      refetchApplications();
                    } else {
                      alert(result.error || "Erreur lors de la mise à jour");
                    }
                  }}
                />
              )}

              {/* Autres missions similaires */}
              <YStack
                backgroundColor="white"
                borderRadius={12}
                padding="$5"
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.1}
                shadowRadius={8}
              >
                <Text
                  fontSize={18}
                  fontWeight="bold"
                  marginBottom="$2"
                  color="#000"
                >
                  Autres missions similaires
                </Text>
                <Text fontSize={14} color="#666">
                  Fonctionnalité à venir
                </Text>
              </YStack>
            </YStack>

            {/* COLONNE DROITE */}
            <MissionDetailSidebar
              mission={mission}
              profile={profile}
              isRecruiter={isRecruiter}
              isMissionOwner={isMissionOwner}
              showSuccessMessage={showSuccessMessage}
              hasApplied={hasApplied}
              isApplying={isApplying}
              isCheckingApplication={isCheckingApplication}
              applyError={applyError}
              onApply={handleApply}
              onManageCandidates={() =>
                router.push(`/missions/${missionId}/candidates`)
              }
            />
          </XStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
