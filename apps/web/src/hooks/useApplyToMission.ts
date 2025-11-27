"use client";

import { useState } from "react";
import { applyToMission } from "@shiftly/core";
import type { CreateApplicationParams } from "@shiftly/data";

/**
 * Hook pour postuler à une mission
 */
export function useApplyToMission() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const apply = async (params: CreateApplicationParams) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await applyToMission(params);
      if (result.success) {
        setSuccess(true);
        return { success: true };
      } else {
        setError(result.error || "Erreur lors de la candidature");
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      const errorMessage = err.message || "Une erreur est survenue";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    apply,
    isLoading,
    error,
    success,
    reset,
  };
}


