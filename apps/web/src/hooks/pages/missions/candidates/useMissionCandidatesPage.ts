"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useCachedMission } from "@/hooks";
import { useCurrentProfile } from "@/hooks";
import { useMissionApplications } from "@/hooks";
import { useUpdateApplicationStatus } from "@/hooks";
import type { ApplicationStatus } from "@shiftly/data";
import {
  getStatusLabel as getStatusLabelUtil,
  getStatusColor as getStatusColorUtil,
  formatApplicationDate,
} from "@/utils/missionHelpers";

type TabType = "candidates" | "details" | "activity";

/**
 * Hook pour gérer la logique de la page des candidats d'une mission
 * Gère les candidatures, les filtres, les sélections et les actions en masse
 */
export function useMissionCandidatesPage() {
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

  // Utiliser les fonctions utilitaires
  const getStatusLabel = getStatusLabelUtil;
  const getStatusColor = getStatusColorUtil;
  const formatDate = formatApplicationDate;

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

  const getFilteredApplications = () => {
    if (statusFilter === "all") return applications;
    return applications.filter((app) => app.status === statusFilter);
  };

  const filteredApplications = useMemo(
    () => getFilteredApplications(),
    [applications, statusFilter]
  );

  const toggleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map((app) => app.id));
    }
  };

  return {
    missionId,
    activeTab,
    setActiveTab,
    selectedApplications,
    statusFilter,
    setStatusFilter,
    mission,
    isLoadingMission,
    profile,
    applications,
    isLoadingApplications,
    isUpdatingStatus,
    isMissionOwner,
    filteredApplications,
    getStatusLabel,
    getStatusColor,
    formatDate,
    handleStatusChange,
    handleBulkAction,
    toggleApplicationSelection,
    toggleSelectAll,
    refetch,
  };
}

