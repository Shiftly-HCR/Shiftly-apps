"use client";

import { useState } from "react";

/**
 * Hook pour créer une session Stripe Billing Portal
 * Permet aux utilisateurs de gérer leur abonnement
 */
export function useBillingPortal() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPortalSession = async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/portal", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de créer la session de gestion");
      }

      return data.url || null;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      console.error("Erreur lors de la création de la session Billing Portal:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const openPortal = async (): Promise<void> => {
    const url = await createPortalSession();
    if (url) {
      window.location.href = url;
    }
  };

  return {
    openPortal,
    isLoading,
    error,
  };
}




