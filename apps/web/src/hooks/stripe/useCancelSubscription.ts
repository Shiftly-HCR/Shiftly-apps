"use client";

import { useState } from "react";
import { supabase } from "@shiftly/data";

/**
 * Hook pour annuler un abonnement Stripe
 * Met cancel_at_period_end = true pour arrêter la facturation à la fin de la période
 */
export function useCancelSubscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelSubscription = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Récupérer le token depuis la session pour l'authentification
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch("/api/payments/cancel", {
        method: "POST",
        credentials: "include",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible d'annuler l'abonnement");
      }

      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      console.error("Erreur lors de l'annulation de l'abonnement:", err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cancelSubscription,
    isLoading,
    error,
  };
}

