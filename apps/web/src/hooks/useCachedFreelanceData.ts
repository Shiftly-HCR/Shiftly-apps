"use client";

import { useState, useEffect } from "react";
import { useSessionContext } from "../providers/SessionProvider";
import {
  getFreelanceExperiencesById,
  getFreelanceEducationsById,
  type FreelanceExperience,
  type FreelanceEducation,
} from "@shiftly/data";

/**
 * Hook pour récupérer les données freelance (expériences + formations) avec cache
 */
export function useCachedFreelanceData(userId: string | null) {
  const {
    getFreelanceExperiencesFromCache,
    getFreelanceEducationsFromCache,
    cacheFreelanceExperiences,
    cacheFreelanceEducations,
  } = useSessionContext();

  const [experiences, setExperiences] = useState<FreelanceExperience[]>([]);
  const [educations, setEducations] = useState<FreelanceEducation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setExperiences([]);
      setEducations([]);
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      // 1. Vérifier le cache d'abord
      const cachedExperiences = getFreelanceExperiencesFromCache(userId);
      const cachedEducations = getFreelanceEducationsFromCache(userId);

      if (cachedExperiences.length > 0 || cachedEducations.length > 0) {
        setExperiences(cachedExperiences);
        setEducations(cachedEducations);
        setIsLoading(false);
        return;
      }

      // 2. Si pas dans le cache, charger depuis Supabase
      try {
        const [loadedExperiences, loadedEducations] = await Promise.all([
          getFreelanceExperiencesById(userId),
          getFreelanceEducationsById(userId),
        ]);

        setExperiences(loadedExperiences);
        setEducations(loadedEducations);

        // Mettre en cache
        if (loadedExperiences.length > 0) {
          cacheFreelanceExperiences(userId, loadedExperiences);
        }
        if (loadedEducations.length > 0) {
          cacheFreelanceEducations(userId, loadedEducations);
        }
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [
    userId,
    getFreelanceExperiencesFromCache,
    getFreelanceEducationsFromCache,
    cacheFreelanceExperiences,
    cacheFreelanceEducations,
  ]);

  return { experiences, educations, isLoading, error };
}



