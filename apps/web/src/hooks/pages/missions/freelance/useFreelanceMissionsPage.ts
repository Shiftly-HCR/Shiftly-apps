"use client";

import { useMemo, useCallback } from "react";
import type { Mission } from "@shiftly/data";
import type { ApplicationStatus } from "@shiftly/data";
import {
  useCurrentProfile,
  usePublishedMissions,
  useFreelanceAppliedMissions,
  useUserApplications,
} from "@/hooks";
import { colors } from "@shiftly/ui";

/**
 * Hook pour gérer la logique de la page des missions freelance
 * Gère le chargement des missions, les missions récentes et recommandées
 */
export function useFreelanceMissionsPage() {
  const { data: profile, isLoading: isLoadingProfile } = useCurrentProfile();
  const {
    missions: appliedMissions = [],
    isLoading: isLoadingAppliedMissions,
  } = useFreelanceAppliedMissions();
  const {
    missions: publishedMissions = [],
    isLoading: isLoadingPublishedMissions,
  } = usePublishedMissions();
  const { applications: userApplications = [], isLoading: isLoadingUserApplications } =
    useUserApplications();
  const isLoading =
    isLoadingProfile ||
    isLoadingAppliedMissions ||
    isLoadingPublishedMissions ||
    isLoadingUserApplications;

  // Calculer les missions récentes et recommandées depuis le cache
  const { missions, recommendedMissions } = useMemo<{
    missions: Mission[];
    recommendedMissions: Mission[];
  }>(() => {
    // Les missions récentes sont celles pour lesquelles le freelance a postulé
    // Trier par date de création décroissante (les plus récentes en premier)
    const recentMissions = appliedMissions.slice(0, 10); // Limiter à 10 missions récentes

    // Prendre les missions publiées comme recommandations (sauf celles déjà affichées)
    // Filtrer les missions déjà affichées et prendre jusqu'à 3 missions recommandées
    const appliedMissionIds = new Set(appliedMissions.map((m) => m.id));
    let recommended = publishedMissions
      .filter((m) => !appliedMissionIds.has(m.id))
      .slice(0, 3);

    // Si aucune mission recommandée n'est disponible (toutes sont dans les missions récentes),
    // afficher toutes les missions disponibles comme recommandations
    if (recommended.length === 0 && publishedMissions.length > 0) {
      recommended = publishedMissions.slice(0, 3);
    }

    return {
      missions: recentMissions,
      recommendedMissions: recommended,
    };
  }, [appliedMissions, publishedMissions]);

  const applicationStats = useMemo(() => {
    const accepted = userApplications.filter((a) => a.status === "accepted").length;
    const pending = userApplications.filter((a) => a.status === "pending").length;
    const total = userApplications.length;
    const successRatePercent = total > 0 ? Math.round((accepted / total) * 100) : 0;
    return {
      activeMissionsCount: accepted,
      pendingApplicationsCount: pending,
      successRatePercent,
    };
  }, [userApplications]);

  const applicationStatusByMissionId = useMemo(() => {
    const map = new Map<string, ApplicationStatus>();
    for (const app of userApplications) {
      map.set(app.mission_id, app.status);
    }
    return map;
  }, [userApplications]);

  const getFullName = useCallback(() => {
    if (!profile) return "Utilisateur";
    const firstName = profile.first_name || "";
    const lastName = profile.last_name || "";
    return `${firstName} ${lastName}`.trim() || "Utilisateur";
  }, [profile]);

  const formatDate = useCallback((date?: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const getApplicationStatusForMission = useCallback(
    (missionId: string): ApplicationStatus | undefined => {
      return applicationStatusByMissionId.get(missionId);
    },
    [applicationStatusByMissionId]
  );

  const getStatusLabel = useCallback((status: ApplicationStatus): string => {
    switch (status) {
      case "accepted":
        return "Accepté";
      case "rejected":
        return "Refusé";
      case "pending":
      case "applied":
        return "En attente";
      case "shortlisted":
        return "Présélectionné";
      case "withdrawn":
        return "Retiré";
    }
  }, []);

  const getStatusColor = useCallback((status: ApplicationStatus): string => {
    switch (status) {
      case "accepted":
        return colors.green600;
      case "rejected":
        return "#DC2626";
      case "pending":
      case "applied":
        return "#F59E0B";
      case "shortlisted":
        return "#2563EB";
      case "withdrawn":
        return colors.gray500;
    }
  }, []);

  return {
    profile,
    missions,
    recommendedMissions,
    applicationStats,
    isLoading,
    getFullName,
    formatDate,
    getApplicationStatusForMission,
    getStatusLabel,
    getStatusColor,
  };
}
