"use client";

import { useSessionContext } from "@/providers/SessionProvider";
import type {
  FreelanceProfile,
  FreelanceExperience,
  FreelanceEducation,
} from "@shiftly/data";

/**
 * Hook pour accéder aux données freelance (profil, expériences, formations)
 */
export function useFreelanceData(): {
  freelanceProfile: FreelanceProfile | null;
  experiences: FreelanceExperience[];
  educations: FreelanceEducation[];
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  refreshExperiences: () => Promise<void>;
  refreshEducations: () => Promise<void>;
} {
  const {
    cache,
    isLoading,
    error,
    refreshProfile,
    refreshFreelanceExperiences,
    refreshFreelanceEducations,
  } = useSessionContext();

  return {
    freelanceProfile: cache?.freelanceProfile || null,
    experiences: cache?.freelanceExperiences || [],
    educations: cache?.freelanceEducations || [],
    isLoading,
    error,
    refreshProfile,
    refreshExperiences: refreshFreelanceExperiences,
    refreshEducations: refreshFreelanceEducations,
  };
}

