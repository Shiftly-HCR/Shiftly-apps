"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPublishedFreelances,
  getFreelanceProfileById,
  getFreelanceExperiencesById,
  getFreelanceEducationsById,
  updateFreelanceProfile,
  upsertFreelanceExperience,
  deleteFreelanceExperience,
  upsertFreelanceEducation,
  deleteFreelanceEducation,
  type FreelanceProfile,
  type FreelanceExperience,
  type FreelanceEducation,
} from "@shiftly/data";

/**
 * Hook pour récupérer tous les freelances publiés
 */
export function usePublishedFreelances() {
  return useQuery({
    queryKey: ["freelance", "published"],
    queryFn: getPublishedFreelances,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook pour récupérer un profil freelance par user_id
 */
export function useFreelanceProfile(userId: string | null) {
  return useQuery({
    queryKey: ["freelance", "profile", userId],
    queryFn: () => (userId ? getFreelanceProfileById(userId) : null),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook pour récupérer les expériences d'un freelance
 */
export function useFreelanceExperiences(userId: string | null) {
  return useQuery({
    queryKey: ["freelance", "experiences", userId],
    queryFn: () => (userId ? getFreelanceExperiencesById(userId) : []),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook pour récupérer les formations d'un freelance
 */
export function useFreelanceEducations(userId: string | null) {
  return useQuery({
    queryKey: ["freelance", "educations", userId],
    queryFn: () => (userId ? getFreelanceEducationsById(userId) : []),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook pour récupérer toutes les données d'un freelance (profil + expériences + formations)
 */
export function useFreelanceData(userId: string | null) {
  const profile = useFreelanceProfile(userId);
  const experiences = useFreelanceExperiences(userId);
  const educations = useFreelanceEducations(userId);

  return {
    profile: profile.data,
    experiences: experiences.data || [],
    educations: educations.data || [],
    isLoading: profile.isLoading || experiences.isLoading || educations.isLoading,
    error: profile.error || experiences.error || educations.error,
  };
}

/**
 * Hook pour mettre à jour le profil freelance
 */
export function useUpdateFreelanceProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFreelanceProfile,
    onSuccess: (result) => {
      if (result.success && result.profile) {
        // Mettre à jour le cache
        queryClient.setQueryData(
          ["freelance", "profile", result.profile.user_id],
          result.profile
        );
        // Invalider la liste des freelances
        queryClient.invalidateQueries({ queryKey: ["freelance", "published"] });
      }
    },
  });
}

/**
 * Hook pour créer ou mettre à jour une expérience
 */
export function useUpsertExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertFreelanceExperience,
    onSuccess: (result) => {
      if (result.success && result.experience) {
        // Invalider les expériences de cet utilisateur
        queryClient.invalidateQueries({
          queryKey: ["freelance", "experiences", result.experience.user_id],
        });
      }
    },
  });
}

/**
 * Hook pour supprimer une expérience
 */
export function useDeleteExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFreelanceExperience,
    onSuccess: (result, experienceId) => {
      if (result.success) {
        // Invalider toutes les expériences (on ne connaît pas le user_id ici)
        queryClient.invalidateQueries({ queryKey: ["freelance", "experiences"] });
      }
    },
  });
}

/**
 * Hook pour créer ou mettre à jour une formation
 */
export function useUpsertEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertFreelanceEducation,
    onSuccess: (result) => {
      if (result.success && result.education) {
        queryClient.invalidateQueries({
          queryKey: ["freelance", "educations", result.education.user_id],
        });
      }
    },
  });
}

/**
 * Hook pour supprimer une formation
 */
export function useDeleteEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFreelanceEducation,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["freelance", "educations"] });
      }
    },
  });
}
