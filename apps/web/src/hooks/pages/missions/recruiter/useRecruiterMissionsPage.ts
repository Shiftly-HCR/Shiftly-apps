"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRecruiterMissions } from "@/hooks";

/**
 * Hook pour gérer la logique de la page des missions recruteur
 * Gère la navigation et les actions sur les missions
 */
export function useRecruiterMissionsPage() {
  const router = useRouter();
  const { missions, isLoading } = useRecruiterMissions();

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

  return {
    missions,
    isLoading,
    handleCreateMission,
    handleMissionClick,
    handleEditMission,
    handleManageCandidates,
  };
}

