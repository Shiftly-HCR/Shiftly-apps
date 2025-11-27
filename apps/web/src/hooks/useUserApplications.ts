"use client";

import { useState, useEffect } from "react";
import { getUserApplications } from "@shiftly/core";
import type { MissionApplicationWithMission } from "@shiftly/data";

/**
 * Hook pour récupérer les candidatures d'un freelance
 */
export function useUserApplications(userId?: string) {
  const [applications, setApplications] = useState<MissionApplicationWithMission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadApplications = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getUserApplications(userId);
        if (result.success) {
          setApplications(result.applications || []);
        } else {
          setError(result.error || "Erreur lors du chargement des candidatures");
          setApplications([]);
        }
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue");
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [userId]);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getUserApplications(userId);
      if (result.success) {
        setApplications(result.applications || []);
      } else {
        setError(result.error || "Erreur lors du chargement des candidatures");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    applications,
    isLoading,
    error,
    refetch,
  };
}


