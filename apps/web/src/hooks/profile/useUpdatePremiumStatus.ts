"use client";

import { useState, useCallback } from "react";
import { updatePremiumStatus } from "@shiftly/data";
import { useCurrentProfile } from "./useCurrentProfile";

/**
 * Hook pour mettre à jour le statut premium de l'utilisateur
 */
export function useUpdatePremiumStatus() {
  const { refresh } = useCurrentProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePremium = useCallback(
    async (isPremium: boolean) => {
      setError(null);
      setIsLoading(true);

      try {
        const result = await updatePremiumStatus(isPremium);

        if (result.success) {
          // Rafraîchir le profil dans le cache
          await refresh();
          return { success: true };
        } else {
          setError(
            result.error || "Erreur lors de la mise à jour du statut premium"
          );
          return { success: false, error: result.error };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de la mise à jour du statut premium";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [refresh]
  );

  return {
    updatePremium,
    isLoading,
    error,
  };
}
