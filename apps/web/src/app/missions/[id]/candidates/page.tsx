"use client";

import { YStack, Text, ScrollView } from "tamagui";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, colors } from "@shiftly/ui";
import { type ApplicationStatus } from "@shiftly/data";
import {
  useCachedMission,
  useMissionApplications,
  useUpdateApplicationStatus,
  useCurrentProfile,
} from "@/hooks";
import {
  AppLayout,
  MissionCandidatesHeader,
  MissionCandidatesTabs,
  MissionCandidatesFilters,
  MissionCandidatesList,
  MissionDetailsTab,
  MissionActivityTab,
} from "@/components";

type TabType = "candidates" | "details" | "activity";

export default function MissionCandidatesPage() {
  const router = useRouter();
  const params = useParams();
  const missionId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>("candidates");
  const [selectedApplications, setSelectedApplications] = useState<string[]>(
    []
  );
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all"
  );

  const { mission, isLoading: isLoadingMission } = useCachedMission(missionId);
  const { profile } = useCurrentProfile();
  const {
    applications,
    isLoading: isLoadingApplications,
    refetch,
  } = useMissionApplications(missionId);
  const { updateStatus, isLoading: isUpdatingStatus } =
    useUpdateApplicationStatus();

  // Vérifier que l'utilisateur est le recruteur propriétaire
  const isMissionOwner = mission?.recruiter_id === profile?.id;

  const getStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "applied":
        return "Reçu";
      case "shortlisted":
        return "Shortlist";
      case "rejected":
        return "Refusé";
      case "accepted":
        return "Confirmé";
      case "withdrawn":
        return "Retiré";
      default:
        return status;
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return colors.shiftlyViolet;
      case "applied":
        return colors.shiftlyViolet;
      case "shortlisted":
        return colors.shiftlyGold;
      case "rejected":
        return "#EF4444";
      case "accepted":
        return "#10B981";
      case "withdrawn":
        return colors.gray500;
      default:
        return colors.gray700;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Reçu aujourd'hui";
    if (diffInDays === 1) return "Reçu il y a 1 jour";
    return `Reçu il y a ${diffInDays} jours`;
  };

  const handleStatusChange = async (
    applicationId: string,
    newStatus: ApplicationStatus
  ) => {
    const result = await updateStatus(applicationId, newStatus);
    if (result.success) {
      refetch();
      setSelectedApplications([]);
    } else {
      alert(result.error || "Erreur lors de la mise à jour");
    }
  };

  const handleBulkAction = async (
    action: "shortlist" | "reject" | "accept"
  ) => {
    if (selectedApplications.length === 0) return;

    const statusMap: Record<string, ApplicationStatus> = {
      shortlist: "shortlisted",
      reject: "rejected",
      accept: "accepted",
    };

    const newStatus = statusMap[action];
    if (!newStatus) return;

    // Mettre à jour toutes les candidatures sélectionnées
    for (const appId of selectedApplications) {
      await handleStatusChange(appId, newStatus);
    }
  };

  const toggleApplicationSelection = (applicationId: string) => {
    setSelectedApplications((prev) =>
      prev.includes(applicationId)
        ? prev.filter((id) => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const toggleSelectAll = () => {
    const filteredApplications = getFilteredApplications();
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map((app) => app.id));
    }
  };

  const getFilteredApplications = () => {
    if (statusFilter === "all") return applications;
    return applications.filter((app) => app.status === statusFilter);
  };

  const filteredApplications = getFilteredApplications();

  if (isLoadingMission) {
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
