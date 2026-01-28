"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getApplicationsByUser,
  getApplicationsByMission,
  createApplication,
  checkApplicationExists,
  type MissionApplication,
  type CreateApplicationParams,
} from "@shiftly/data";
import { updateApplicationStatus } from "@shiftly/core";
import type { ApplicationStatus } from "@shiftly/data";

/**
 * Hook pour récupérer les candidatures de l'utilisateur actuel
 */
export function useUserApplications() {
  const query = useQuery({
    queryKey: ["applications", "user"],
    queryFn: () => getApplicationsByUser(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  return {
    ...query,
    applications: query.data ?? [],
  } as typeof query & {
    applications: MissionApplication[];
  };
}

/**
 * Hook pour récupérer les candidatures d'une mission
 */
export function useMissionApplications(missionId: string | null) {
  const query = useQuery({
    queryKey: ["applications", "mission", missionId],
    queryFn: () => (missionId ? getApplicationsByMission(missionId) : []),
    enabled: !!missionId,
    staleTime: 1 * 60 * 1000,
  });

  return {
    ...query,
    applications: query.data ?? [],
  } as typeof query & {
    applications: MissionApplication[];
  };
}

/**
 * Hook pour vérifier si l'utilisateur a déjà postulé à une mission
 */
export function useCheckApplication(missionId: string | null) {
  const query = useQuery({
    queryKey: ["applications", "check", missionId],
    queryFn: async () => {
      if (!missionId) return false;
      // Récupérer l'utilisateur actuel
      const { getCurrentUser } = await import("@shiftly/data");
      const user = await getCurrentUser();
      if (!user) return false;
      return await checkApplicationExists(missionId, user.id);
    },
    enabled: !!missionId,
    staleTime: 1 * 60 * 1000,
  });

  return {
    ...query,
    hasApplied: query.data ?? false,
  } as typeof query & {
    hasApplied: boolean;
  };
}

/**
 * Hook pour postuler à une mission
 */
export function useApplyToMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createApplication,
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalider les candidatures de l'utilisateur
        queryClient.invalidateQueries({ queryKey: ["applications", "user"] });
        // Invalider les candidatures de la mission
        queryClient.invalidateQueries({
          queryKey: ["applications", "mission", variables.mission_id],
        });
        // Invalider le check de candidature
        queryClient.invalidateQueries({
          queryKey: ["applications", "check", variables.mission_id],
        });
      }
    },
  });
}

/**
 * Hook pour mettre à jour le statut d'une candidature
 * Utilise le service @shiftly/core qui inclut la logique métier (messages automatiques, etc.)
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: ApplicationStatus;
    }) => updateApplicationStatus(applicationId, status),
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalider les candidatures de toutes les missions pour être sûr
        queryClient.invalidateQueries({ queryKey: ["applications", "mission"] });
        // Invalider les candidatures de l'utilisateur
        queryClient.invalidateQueries({ queryKey: ["applications", "user"] });
      }
    },
  });

  return {
    ...mutation,
    updateStatus: async (applicationId: string, status: ApplicationStatus) =>
      mutation.mutateAsync({ applicationId, status }),
    isLoading: mutation.isPending,
  } as typeof mutation & {
    updateStatus: (
      applicationId: string,
      status: ApplicationStatus
    ) => ReturnType<typeof mutation.mutateAsync>;
    isLoading: boolean;
  };
}
