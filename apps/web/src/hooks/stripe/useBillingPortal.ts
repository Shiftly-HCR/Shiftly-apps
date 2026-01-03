"use client";

import { useState } from "react";
import { supabase } from "@shiftly/data";

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

      console.log("📤 Création de la session Billing Portal...");
      const response = await fetch("/api/payments/portal", {
        method: "POST",
        credentials: "include",
        headers,
      });

      console.log("📥 Réponse reçue, status:", response.status);

      const data = await response.json().catch((jsonErr) => {
        console.error("Erreur lors du parsing JSON:", jsonErr);
        return { error: "Erreur lors de la lecture de la réponse" };
      });

      console.log("📋 Données reçues:", data);

      if (!response.ok) {
        const errorMessage =
          data?.error ||
          `Erreur ${response.status}: Impossible de créer la session de gestion`;
        console.error("❌ Erreur API:", errorMessage);
        throw new Error(errorMessage);
      }

      if (!data?.url) {
        console.error("❌ Pas d'URL dans la réponse:", data);
        throw new Error("Aucune URL de portail reçue");
      }

      console.log("✅ URL du portail reçue:", data.url);
      return data.url;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      console.error(
        "Erreur lors de la création de la session Billing Portal:",
        err
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const openPortal = async (): Promise<void> => {
    const url = await createPortalSession();
    if (url) {
      console.log("🔄 Redirection vers le portail Stripe:", url);
      window.location.href = url;
    } else {
      console.error("❌ Aucune URL de portail reçue");
      // L'erreur est déjà définie dans createPortalSession
    }
  };

  return {
    openPortal,
    isLoading,
    error,
  };
}
