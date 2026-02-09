"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRecruiterMissions, useRecruiterMissionsQuota, useDeleteMission } from "@/hooks";
import { useShiftlyToast } from "@shiftly/ui";

/**
 * Hook pour gérer la logique de la page des missions recruteur
 * Gère la navigation et les actions sur les missions
 */
export function useRecruiterMissionsPage() {
  const router = useRouter();
  const { missions, isLoading } = useRecruiterMissions();
  const { count: activeMissionsCount, limit: activeMissionsLimit, canCreate: canCreateMissionByQuota } =
    useRecruiterMissionsQuota();
  const deleteMissionMutation = useDeleteMission();
  const toast = useShiftlyToast();

  const handleCreateMission = useCallback(() => {
    router.push("/missions/create");
  }, [router]);

  const handleMissionClick = useCallback(
    (missionId: string) => {
      router.push(`/missions/${missionId}`);
    },
    [router]
  );

  const handleEditMission = useCallback(
    (missionId: string) => {
      router.push(`/missions/${missionId}/edit`);
    },
    [router]
  );

  const handleManageCandidates = useCallback(
    (missionId: string) => {
      router.push(`/missions/${missionId}/candidates`);
    },
    [router]
  );

  const handleDeleteMission = useCallback(
    async (missionId: string, missionTitle: string) => {
      // Confirmation avant suppression
      const confirmed = window.confirm(
        `Êtes-vous sûr de vouloir supprimer la mission "${missionTitle}" ?\n\nCette action est irréversible.`
      );

      if (!confirmed) {
        return;
      }

      try {
        const result = await deleteMissionMutation.mutateAsync(missionId);
        
        if (result.success) {
          toast.success("Mission supprimée avec succès");
        } else {
          toast.error(result.error || "Erreur lors de la suppression de la mission");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Une erreur est survenue lors de la suppression");
      }
    },
    [deleteMissionMutation, toast]
  );

  return {
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
  };
}

