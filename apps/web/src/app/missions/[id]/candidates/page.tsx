"use client";

import { YStack, XStack, Text, ScrollView, Image } from "tamagui";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, colors } from "@shiftly/ui";
import { type Mission, type ApplicationStatus } from "@shiftly/data";
import { useCachedMission, useMissionApplications, useUpdateApplicationStatus, useCurrentProfile } from "../../../../hooks";
import { AppLayout } from "../../../../components/AppLayout";

// Composant Checkbox simple pour la sélection
const SimpleCheckbox = ({ checked, onPress }: { checked: boolean; onPress: () => void }) => (
  <XStack
    width={20}
    height={20}
    borderRadius={4}
    borderWidth={2}
    borderColor={checked ? colors.shiftlyViolet : colors.gray300}
    backgroundColor={checked ? colors.shiftlyViolet : colors.white}
    alignItems="center"
    justifyContent="center"
    cursor="pointer"
    onPress={onPress}
  >
    {checked && <Text color={colors.white} fontSize={12} fontWeight="bold">✓</Text>}
  </XStack>
);

type TabType = "candidates" | "details" | "activity";

export default function MissionCandidatesPage() {
  const router = useRouter();
  const params = useParams();
  const missionId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>("candidates");
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");

  const { mission, isLoading: isLoadingMission } = useCachedMission(missionId);
  const { profile } = useCurrentProfile();
  const { applications, isLoading: isLoadingApplications, refetch } = useMissionApplications(missionId);
  const { updateStatus, isLoading: isUpdatingStatus } = useUpdateApplicationStatus();

  // Vérifier que l'utilisateur est le recruteur propriétaire
  const isMissionOwner = mission?.recruiter_id === profile?.id;

  const getStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
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

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    const result = await updateStatus(applicationId, newStatus);
    if (result.success) {
      refetch();
      setSelectedApplications([]);
    } else {
      alert(result.error || "Erreur lors de la mise à jour");
    }
  };

  const handleBulkAction = async (action: "shortlist" | "reject" | "accept") => {
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
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
          <Text fontSize={16} color={colors.gray700}>Chargement...</Text>
        </YStack>
      </AppLayout>
    );
  }

  if (!mission) {
    return (
      <AppLayout>
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$4">
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
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$4">
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
        <YStack maxWidth={1400} width="100%" alignSelf="center" padding="$6" gap="$6">
          {/* En-tête de la mission */}
          <YStack
            backgroundColor={colors.white}
            borderRadius={12}
            padding="$5"
            borderWidth={1}
            borderColor={colors.gray200}
            gap="$4"
          >
            <XStack justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="$4">
              <YStack flex={1} gap="$2">
                <Text fontSize={28} fontWeight="700" color={colors.gray900}>
                  {mission.title}
                </Text>
                <Text fontSize={16} color={colors.gray700}>
                  {mission.city || mission.address || "Localisation non définie"}
                </Text>
              </YStack>
              <XStack
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius={20}
                backgroundColor={
                  mission.status === "published" ? "#10B981" : colors.gray500
                }
              >
                <Text fontSize={14} color={colors.white} fontWeight="600">
                  {mission.status === "published" ? "Publiée" : mission.status}
                </Text>
              </XStack>
            </XStack>

            {/* Informations rapides */}
            <XStack gap="$4" flexWrap="wrap">
              {mission.start_date && (
                <XStack alignItems="center" gap="$2">
                  <Text fontSize={18}>📅</Text>
                  <Text fontSize={14} color={colors.gray700}>
                    {new Date(mission.start_date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                    {mission.start_time && `, ${mission.start_time}`}
                    {mission.end_time && `-${mission.end_time}`}
                  </Text>
                </XStack>
              )}
              {mission.hourly_rate && (
                <XStack alignItems="center" gap="$2">
                  <Text fontSize={18}>💰</Text>
                  <Text fontSize={14} color={colors.gray700} fontWeight="600">
                    {mission.hourly_rate}€ / heure
                  </Text>
                </XStack>
              )}
              {mission.is_urgent && (
                <XStack alignItems="center" gap="$2">
                  <Text fontSize={18}>⭐</Text>
                  <Text fontSize={14} color={colors.shiftlyGold} fontWeight="600">
                    Visibilité Boostée
                  </Text>
                </XStack>
              )}
            </XStack>
          </YStack>

          {/* Onglets */}
          <XStack gap="$2" borderBottomWidth={1} borderBottomColor={colors.gray200}>
            <Button
              variant={activeTab === "candidates" ? "primary" : "outline"}
              size="md"
              onPress={() => setActiveTab("candidates")}
              borderRadius={0}
              borderBottomWidth={activeTab === "candidates" ? 2 : 0}
              borderBottomColor={activeTab === "candidates" ? colors.shiftlyViolet : "transparent"}
            >
              <XStack alignItems="center" gap="$2">
                <Text>Candidats</Text>
                {applications.length > 0 && (
                  <XStack
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    borderRadius={12}
                    backgroundColor={activeTab === "candidates" ? colors.white : colors.gray200}
                  >
                    <Text
                      fontSize={12}
                      fontWeight="600"
                      color={activeTab === "candidates" ? colors.shiftlyViolet : colors.gray700}
                    >
                      {applications.length}
                    </Text>
                  </XStack>
                )}
              </XStack>
            </Button>
            <Button
              variant={activeTab === "details" ? "primary" : "outline"}
              size="md"
              onPress={() => setActiveTab("details")}
              borderRadius={0}
              borderBottomWidth={activeTab === "details" ? 2 : 0}
              borderBottomColor={activeTab === "details" ? colors.shiftlyViolet : "transparent"}
            >
              Détails
            </Button>
            <Button
              variant={activeTab === "activity" ? "primary" : "outline"}
              size="md"
              onPress={() => setActiveTab("activity")}
              borderRadius={0}
              borderBottomWidth={activeTab === "activity" ? 2 : 0}
              borderBottomColor={activeTab === "activity" ? colors.shiftlyViolet : "transparent"}
            >
              Journal d'activité
            </Button>
          </XStack>

          {/* Contenu des onglets */}
          {activeTab === "candidates" && (
            <YStack gap="$4">
              {/* Filtres et actions en masse */}
              <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
                <XStack gap="$2" alignItems="center">
                  <SimpleCheckbox
                    checked={
                      filteredApplications.length > 0 &&
                      selectedApplications.length === filteredApplications.length
                    }
                    onPress={toggleSelectAll}
                  />
                  <Text fontSize={14} color={colors.gray700}>
                    {selectedApplications.length > 0
                      ? `${selectedApplications.length} sélectionné(s)`
                      : "Tout sélectionner"}
                  </Text>
                </XStack>

                <XStack gap="$2" flexWrap="wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => handleBulkAction("shortlist")}
                    disabled={selectedApplications.length === 0 || isUpdatingStatus}
                  >
                    Sélectionner
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => handleBulkAction("reject")}
                    disabled={selectedApplications.length === 0 || isUpdatingStatus}
                  >
                    Refuser
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={() => handleBulkAction("accept")}
                    disabled={selectedApplications.length === 0 || isUpdatingStatus}
                  >
                    Confirmer
                  </Button>
                </XStack>
              </XStack>

              {/* Filtres de statut */}
              <XStack gap="$2" flexWrap="wrap">
                {(["all", "applied", "shortlisted", "accepted"] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={statusFilter === filter ? "primary" : "outline"}
                    size="sm"
                    onPress={() => setStatusFilter(filter)}
                  >
                    {filter === "all"
                      ? "Tous"
                      : filter === "applied"
                        ? "Reçu"
                        : filter === "shortlisted"
                          ? "Shortlist"
                          : "Confirmés"}
                  </Button>
                ))}
              </XStack>

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
                <YStack
                  backgroundColor={colors.white}
                  borderRadius={12}
                  borderWidth={1}
                  borderColor={colors.gray200}
                  overflow="hidden"
                >
                  {/* En-tête du tableau */}
                  <XStack
                    padding="$4"
                    borderBottomWidth={1}
                    borderBottomColor={colors.gray200}
                    backgroundColor={colors.gray050}
                  >
                    <XStack width="40px" alignItems="center" justifyContent="center">
                      {/* Checkbox pour sélection */}
                    </XStack>
                    <XStack flex={1}>
                      <Text fontSize={14} fontWeight="600" color={colors.gray700}>
                        NOM
                      </Text>
                    </XStack>
                    <XStack width={120} alignItems="center">
                      <Text fontSize={14} fontWeight="600" color={colors.gray700}>
                        STATUT
                      </Text>
                    </XStack>
                    <XStack width={80} alignItems="center">
                      <Text fontSize={14} fontWeight="600" color={colors.gray700}>
                        NOTE
                      </Text>
                    </XStack>
                    <XStack width={80} alignItems="center">
                      <Text fontSize={14} fontWeight="600" color={colors.gray700}>
                        ACTIONS
                      </Text>
                    </XStack>
                  </XStack>

                  {/* Liste des candidats */}
                  <YStack>
                    {filteredApplications.map((application) => {
                      const profileName = application.profile
                        ? `${application.profile.first_name || ""} ${application.profile.last_name || ""}`.trim() ||
                          "Nom non renseigné"
                        : `Utilisateur ${application.user_id.substring(0, 8)}`;
                      const isSelected = selectedApplications.includes(application.id);
                      const availableStatuses: ApplicationStatus[] =
                        application.status === "applied"
                          ? ["shortlisted", "rejected"]
                          : application.status === "shortlisted"
                            ? ["accepted", "rejected"]
                            : [];

                      return (
                        <XStack
                          key={application.id}
                          padding="$4"
                          borderBottomWidth={1}
                          borderBottomColor={colors.gray200}
                          alignItems="center"
                          hoverStyle={{
                            backgroundColor: colors.gray050,
                          }}
                        >
                          {/* Checkbox */}
                          <XStack width="40px" alignItems="center" justifyContent="center">
                            <SimpleCheckbox
                              checked={isSelected}
                              onPress={() => toggleApplicationSelection(application.id)}
                            />
                          </XStack>

                          {/* Nom et photo */}
                          <XStack flex={1} alignItems="center" gap="$3">
                            {application.profile?.photo_url ? (
                              <YStack
                                width={48}
                                height={48}
                                borderRadius={24}
                                overflow="hidden"
                                backgroundColor={colors.gray200}
                              >
                                <Image
                                  source={{ uri: application.profile.photo_url }}
                                  width="100%"
                                  height="100%"
                                  resizeMode="cover"
                                />
                              </YStack>
                            ) : (
                              <YStack
                                width={48}
                                height={48}
                                borderRadius={24}
                                backgroundColor={colors.gray200}
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Text fontSize={18} color={colors.gray500}>
                                  {profileName.charAt(0).toUpperCase()}
                                </Text>
                              </YStack>
                            )}
                            <YStack>
                              <Text fontSize={14} fontWeight="600" color={colors.gray900}>
                                {profileName}
                              </Text>
                              <Text fontSize={12} color={colors.gray500}>
                                {formatDate(application.created_at)}
                              </Text>
                            </YStack>
                          </XStack>

                          {/* Statut */}
                          <XStack width={120} alignItems="center">
                            <XStack
                              paddingHorizontal="$2"
                              paddingVertical="$1"
                              borderRadius={12}
                              backgroundColor={getStatusColor(application.status) + "20"}
                            >
                              <Text
                                fontSize={12}
                                fontWeight="600"
                                color={getStatusColor(application.status)}
                              >
                                {getStatusLabel(application.status)}
                              </Text>
                            </XStack>
                          </XStack>

                          {/* Note (placeholder) */}
                          <XStack width={80} alignItems="center" gap="$1">
                            <Text fontSize={14}>⭐</Text>
                            <Text fontSize={14} color={colors.gray700} fontWeight="600">
                              4.8
                            </Text>
                          </XStack>

                          {/* Actions */}
                          <XStack width={80} alignItems="center" justifyContent="flex-end">
                            {availableStatuses.length > 0 ? (
                              <YStack position="relative">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onPress={() => {
                                    // Menu déroulant simplifié - on peut améliorer avec un dropdown
                                    const firstAction = availableStatuses[0];
                                    handleStatusChange(application.id, firstAction);
                                  }}
                                  disabled={isUpdatingStatus}
                                >
                                  ⋯
                                </Button>
                              </YStack>
                            ) : (
                              <Text fontSize={14} color={colors.gray500}>
                                -
                              </Text>
                            )}
                          </XStack>
                        </XStack>
                      );
                    })}
                  </YStack>
                </YStack>
              )}
            </YStack>
          )}

          {activeTab === "details" && (
            <YStack
              backgroundColor={colors.white}
              borderRadius={12}
              padding="$6"
              borderWidth={1}
              borderColor={colors.gray200}
              gap="$4"
            >
              <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                Détails de la mission
              </Text>
              <YStack gap="$3">
                <Text fontSize={14} color={colors.gray700} lineHeight={22}>
                  {mission.description || "Aucune description disponible"}
                </Text>
                {mission.skills && mission.skills.length > 0 && (
                  <YStack gap="$2">
                    <Text fontSize={14} fontWeight="600" color={colors.gray900}>
                      Compétences requises :
                    </Text>
                    <XStack gap="$2" flexWrap="wrap">
                      {mission.skills.map((skill, index) => (
                        <XStack
                          key={index}
                          paddingHorizontal="$3"
                          paddingVertical="$2"
                          borderRadius={20}
                          backgroundColor={colors.shiftlyVioletLight}
                        >
                          <Text fontSize={12} color={colors.shiftlyViolet} fontWeight="600">
                            {skill}
                          </Text>
                        </XStack>
                      ))}
                    </XStack>
                  </YStack>
                )}
              </YStack>
            </YStack>
          )}

          {activeTab === "activity" && (
            <YStack
              backgroundColor={colors.white}
              borderRadius={12}
              padding="$6"
              borderWidth={1}
              borderColor={colors.gray200}
              gap="$4"
            >
              <Text fontSize={20} fontWeight="700" color={colors.gray900}>
                Journal d'activité
              </Text>
              <Text fontSize={14} color={colors.gray700}>
                Fonctionnalité à venir
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}

