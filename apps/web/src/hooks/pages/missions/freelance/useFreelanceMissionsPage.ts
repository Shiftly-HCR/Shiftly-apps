"use client";

import { useMemo, useCallback } from "react";
import type { Mission } from "@shiftly/data";
import { useCurrentProfile, usePublishedMissions } from "@/hooks";
import { colors } from "@shiftly/ui";

/**
 * Hook pour gérer la logique de la page des missions freelance
 * Gère le chargement des missions, les missions récentes et recommandées
 */
export function useFreelanceMissionsPage() {
  const { data: profile, isLoading: isLoadingProfile } = useCurrentProfile();
  const { data: publishedMissions = [], isLoading: isLoadingMissions } = usePublishedMissions();
  const isLoading = isLoadingProfile || isLoadingMissions;

  // Calculer les missions récentes et recommandées depuis le cache
  const { missions, recommendedMissions } = useMemo(() => {
    // Simuler des missions récentes pour le freelance
    // En production, il faudrait une table de candidatures
    // Prendre seulement 2 missions pour les missions récentes pour laisser de la place aux recommandations
    const recentMissions = publishedMissions.slice(0, 2);

    // Prendre les missions suivantes comme recommandations (sauf celles déjà affichées)
    // Filtrer les missions déjà affichées et prendre jusqu'à 3 missions recommandées
    const recentMissionIds = new Set(recentMissions.map((m) => m.id));
    let recommended = publishedMissions
      .filter((m) => !recentMissionIds.has(m.id))
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
  }, [publishedMissions]);

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

  const getMissionStatus = useCallback(
    (mission: Mission): "in_progress" | "completed" | "pending" => {
      // Logique simplifiée - en production, utiliser une table de candidatures
      if (mission.status === "closed") return "completed";
      if (mission.status === "published") return "in_progress";
      return "pending";
    },
    []
  );

  const getStatusLabel = useCallback(
    (status: "in_progress" | "completed" | "pending") => {
      switch (status) {
        case "in_progress":
          return "En cours";
        case "completed":
          return "Terminée";
        case "pending":
          return "En attente";
      }
    },
    []
  );

  const getStatusColor = useCallback(
    (status: "in_progress" | "completed" | "pending") => {
      switch (status) {
        case "in_progress":
          return colors.shiftlyViolet;
        case "completed":
          return colors.gray500;
        case "pending":
          return "#F59E0B";
      }
    },
    []
  );

  return {
    profile,
    missions,
    recommendedMissions,
    isLoading,
    getFullName,
    formatDate,
    getMissionStatus,
    getStatusLabel,
    getStatusColor,
  };
}

