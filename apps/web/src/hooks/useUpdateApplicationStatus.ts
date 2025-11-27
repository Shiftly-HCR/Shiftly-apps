"use client";

import { useState } from "react";
import { updateApplicationStatus as updateApplicationStatusService } from "@shiftly/core";
import type { ApplicationStatus } from "@shiftly/data";

/**
 * Hook pour mettre à jour le statut d'une candidature
 */
export function useUpdateApplicationStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateStatus = async (applicationId: string, status: ApplicationStatus) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateApplicationStatusService(applicationId, status);
      if (result.success) {
        setSuccess(true);
        return { success: true };
      } else {
        setError(result.error || "Erreur lors de la mise à jour du statut");
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
    updateStatus,
    isLoading,
    error,
    success,
    reset,
  };
}

