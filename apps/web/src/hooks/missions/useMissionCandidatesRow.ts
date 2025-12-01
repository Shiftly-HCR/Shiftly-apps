"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type {
  MissionApplicationWithProfile,
  ApplicationStatus,
} from "@shiftly/data";

interface UseMissionCandidatesRowProps {
  application: MissionApplicationWithProfile;
}

/**
 * Hook pour gérer la logique d'une ligne de candidat dans la liste des candidats d'une mission
 * Gère la navigation, le nom du profil et les statuts disponibles
 */
export function useMissionCandidatesRow({
  application,
}: UseMissionCandidatesRowProps) {
  const router = useRouter();

  // Construire le nom du profil
  const profileName = application.profile
    ? `${application.profile.first_name || ""} ${application.profile.last_name || ""}`.trim() ||
      "Nom non renseigné"
    : `Utilisateur ${application.user_id.substring(0, 8)}`;

  // Navigation vers le profil du candidat
  const handleNameClick = useCallback(() => {
    router.push(`/profile/${application.user_id}`);
  }, [router, application.user_id]);

  // Déterminer les statuts disponibles selon le statut actuel
  const availableStatuses: ApplicationStatus[] =
    application.status === "pending"
      ? ["shortlisted", "rejected", "accepted"]
      : application.status === "applied"
        ? ["shortlisted", "rejected"]
        : application.status === "shortlisted"
          ? ["accepted", "rejected"]
          : [];

  return {
    profileName,
    handleNameClick,
    availableStatuses,
  };
}
