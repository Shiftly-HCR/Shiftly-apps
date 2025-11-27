"use client";

import { useState, useEffect } from "react";
import { checkApplicationExists } from "@shiftly/data";
import { supabase } from "@shiftly/data";

/**
 * Hook pour vérifier si l'utilisateur a déjà postulé à une mission
 */
export function useCheckApplication(missionId: string | null) {
  const [hasApplied, setHasApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!missionId) {
      setHasApplied(false);
      setIsLoading(false);
      return;
    }

    const check = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setHasApplied(false);
          setIsLoading(false);
          return;
        }

        const exists = await checkApplicationExists(missionId, user.id);
        setHasApplied(exists);
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue");
        setHasApplied(false);
      } finally {
        setIsLoading(false);
      }
    };

    check();
  }, [missionId]);

  return {
    hasApplied,
    isLoading,
    error,
  };
}

