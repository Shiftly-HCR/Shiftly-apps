"use client";

import { useState, useEffect } from "react";
import { getMissionApplications } from "@shiftly/core";
import type { MissionApplicationWithProfile } from "@shiftly/data";

/**
 * Hook pour récupérer les candidatures d'une mission (pour les recruteurs)
 */
export function useMissionApplications(missionId: string | null) {
  const [applications, setApplications] = useState<MissionApplicationWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!missionId) {
      setApplications([]);
      setIsLoading(false);
      return;
    }

    const loadApplications = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getMissionApplications(missionId);
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
  }, [missionId]);

  const refetch = async () => {
    if (!missionId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await getMissionApplications(missionId);
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

