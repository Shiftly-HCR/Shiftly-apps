"use client";

import { YStack, ScrollView } from "tamagui";
import { AppLayout, PageLoading } from "@/components";
import {
  RecruiterMissionsHeader,
  RecruiterMissionsList,
  EstablishmentsManager,
} from "@/components/mission";
import { useRecruiterMissionsPage, useResponsive } from "@/hooks";

export default function RecruiterMissionsPage() {
  const { isMobile } = useResponsive();
  const {
    missions,
    isLoading,
    handleCreateMission,
    handleMissionClick,
    handleEditMission,
    handleManageCandidates,
    handleDeleteMission,
    activeMissionsCount,
    activeMissionsLimit,
    canCreateMissionByQuota,
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
          padding={isMobile ? "$4" : "$6"}
          gap="$6"
        >
          <EstablishmentsManager />

          <RecruiterMissionsHeader missions={missions} />

          <RecruiterMissionsList
            missions={missions}
            onCreateMission={handleCreateMission}
            onMissionClick={handleMissionClick}
            onEditMission={handleEditMission}
            onManageCandidates={handleManageCandidates}
            onDeleteMission={handleDeleteMission}
            canCreateMissionByQuota={canCreateMissionByQuota}
            activeMissionsCount={activeMissionsCount}
            activeMissionsLimit={activeMissionsLimit}
          />
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
