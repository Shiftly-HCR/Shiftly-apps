"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPublishedMissions,
  getRecruiterMissions,
  getFreelanceAppliedMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission,
  uploadMissionImage,
  type Mission,
  type CreateMissionParams,
  type UpdateMissionParams,
} from "@shiftly/data";

/**
 * Hook pour récupérer toutes les missions publiées
 */
export function usePublishedMissions() {
  const query = useQuery({
    queryKey: ["missions", "published"],
    queryFn: getPublishedMissions,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    ...query,
    missions: query.data ?? [],
  } as typeof query & {
    missions: Mission[];
  };
}

/**
 * Hook pour récupérer les missions du recruteur actuel
 */
export function useRecruiterMissions() {
  const query = useQuery({
    queryKey: ["missions", "recruiter"],
    queryFn: getRecruiterMissions,
    staleTime: 2 * 60 * 1000,
  });

  return {
    ...query,
    missions: query.data ?? [],
    refresh: async () => {
      await query.refetch();
    },
  } as typeof query & {
    missions: Mission[];
    refresh: () => Promise<void>;
  };
}

/**
 * Hook pour récupérer les missions pour lesquelles le freelance a postulé
 */
export function useFreelanceAppliedMissions() {
  const query = useQuery({
    queryKey: ["missions", "freelance", "applied"],
    queryFn: () => getFreelanceAppliedMissions(),
    staleTime: 2 * 60 * 1000,
  });

  return {
    ...query,
    missions: query.data ?? [],
  } as typeof query & {
    missions: Mission[];
  };
}

/**
 * Hook pour récupérer une mission par ID
 */
export function useMission(missionId: string | null) {
  const query = useQuery({
    queryKey: ["missions", missionId],
    queryFn: () => (missionId ? getMissionById(missionId) : null),
    enabled: !!missionId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    ...query,
    mission: query.data ?? null,
  } as typeof query & {
    mission: Mission | null;
  };
}

/**
 * Hook pour créer une mission
 */
export function useCreateMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMission,
    onSuccess: (result) => {
      if (result.success && result.mission) {
        // Ajouter la mission au cache
        queryClient.setQueryData(["missions", result.mission.id], result.mission);
        
        // Invalider les listes de missions pour les recharger
        queryClient.invalidateQueries({ queryKey: ["missions", "published"] });
        queryClient.invalidateQueries({ queryKey: ["missions", "recruiter"] });
      }
    },
  });
}

/**
 * Hook pour mettre à jour une mission
 */
export function useUpdateMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ missionId, params }: { missionId: string; params: UpdateMissionParams }) =>
      updateMission(missionId, params),
    onSuccess: (result, variables) => {
      if (result.success && result.mission) {
        // Mettre à jour le cache de la mission
        queryClient.setQueryData(["missions", variables.missionId], result.mission);
        
        // Invalider les listes de missions
        queryClient.invalidateQueries({ queryKey: ["missions", "published"] });
        queryClient.invalidateQueries({ queryKey: ["missions", "recruiter"] });
      }
    },
  });
}

/**
 * Hook pour supprimer une mission
 */
export function useDeleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMission,
    onSuccess: (result, missionId) => {
      if (result.success) {
        // Retirer la mission du cache
        queryClient.removeQueries({ queryKey: ["missions", missionId] });
        
        // Invalider les listes de missions
        queryClient.invalidateQueries({ queryKey: ["missions", "published"] });
        queryClient.invalidateQueries({ queryKey: ["missions", "recruiter"] });
      }
    },
  });
}

/**
 * Hook pour uploader une image de mission
 */
export function useUploadMissionImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ missionId, file }: { missionId: string; file: File }) =>
      uploadMissionImage(missionId, file),
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalider la mission pour recharger avec la nouvelle image
        queryClient.invalidateQueries({ queryKey: ["missions", variables.missionId] });
      }
    },
  });
}
