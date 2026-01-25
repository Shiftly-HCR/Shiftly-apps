"use client";

export const dynamic = "force-dynamic";

import { YStack, Text, ScrollView } from "tamagui";
import { useRouter } from "next/navigation";
import { Button, colors } from "@shiftly/ui";
import { type ApplicationStatus } from "@shiftly/data";
import {
  AppLayout,
  MissionCandidatesHeader,
  MissionCandidatesTabs,
  MissionCandidatesFilters,
  MissionCandidatesList,
  MissionDetailsTab,
  MissionActivityTab,
  PageLoading,
} from "@/components";
import { useMissionCandidatesPage } from "@/hooks";

type TabType = "candidates" | "details" | "activity";

export default function MissionCandidatesPage() {
  const router = useRouter();
  const {
    missionId,
    activeTab,
    setActiveTab,
    selectedApplications,
    statusFilter,
    setStatusFilter,
    mission,
    isLoadingMission,
    isLoadingApplications,
    isUpdatingStatus,
    isMissionOwner,
    filteredApplications,
    applications,
    getStatusLabel,
    getStatusColor,
    formatDate,
    handleStatusChange,
    handleBulkAction,
    toggleApplicationSelection,
    toggleSelectAll,
  } = useMissionCandidatesPage();

  if (isLoadingMission) {
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
          <Text fontSize={20} fontWeight="700" color={colors.gray900}>
            Mission introuvable
          </Text>
          <Button variant="primary" onPress={() => router.push("/missions")}>
            Retour aux missions
          </Button>
        </YStack>
      </AppLayout>
    );
  }

  if (!isMissionOwner) {
    return (
      <AppLayout>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$6"
          gap="$4"
        >
          <Text fontSize={20} fontWeight="700" color={colors.gray900}>
            Accès non autorisé
          </Text>
          <Text fontSize={14} color={colors.gray700} textAlign="center">
            Vous n'êtes pas autorisé à gérer les candidatures de cette mission
          </Text>
          <Button variant="primary" onPress={() => router.push("/missions")}>
            Retour aux missions
          </Button>
        </YStack>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ScrollView backgroundColor={colors.backgroundLight} flex={1}>
        <YStack
          maxWidth={1400}
          width="100%"
          alignSelf="center"
          padding="$6"
          gap="$6"
        >
          {/* En-tête de la mission */}
          <MissionCandidatesHeader mission={mission} />

          {/* Onglets */}
          <MissionCandidatesTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            candidatesCount={applications.length}
          />

          {/* Contenu des onglets */}
          {activeTab === "candidates" && (
            <YStack gap="$4">
              {/* Filtres et actions en masse */}
              <MissionCandidatesFilters
                selectedCount={selectedApplications.length}
                totalCount={filteredApplications.length}
                onSelectAll={toggleSelectAll}
                onBulkAction={handleBulkAction}
                isUpdating={isUpdatingStatus}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />

              {/* Liste des candidatures */}
              {isLoadingApplications ? (
                <YStack padding="$8" alignItems="center">
                  <Text fontSize={14} color={colors.gray700}>
                    Chargement des candidatures...
                  </Text>
                </YStack>
              ) : filteredApplications.length === 0 ? (
                <YStack
                  padding="$8"
                  backgroundColor={colors.white}
                  borderRadius={12}
                  borderWidth={1}
                  borderColor={colors.gray200}
                  alignItems="center"
                  gap="$2"
                >
                  <Text fontSize={16} color={colors.gray700} fontWeight="600">
                    {statusFilter === "all"
                      ? "Aucune candidature pour le moment"
                      : `Aucune candidature avec le statut "${getStatusLabel(statusFilter as ApplicationStatus)}"`}
                  </Text>
                </YStack>
              ) : (
                <MissionCandidatesList
                  applications={filteredApplications}
                  selectedApplications={selectedApplications}
                  onToggleSelection={toggleApplicationSelection}
                  onStatusChange={handleStatusChange}
                  isUpdating={isUpdatingStatus}
                  getStatusLabel={getStatusLabel}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                  missionId={missionId}
                  recruiterId={mission?.recruiter_id}
                />
              )}
            </YStack>
          )}

          {activeTab === "details" && <MissionDetailsTab mission={mission} />}

          {activeTab === "activity" && <MissionActivityTab />}
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
