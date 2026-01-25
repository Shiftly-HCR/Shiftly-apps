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

  const cancelSubscription = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔄 Début de l'annulation de l'abonnement...");

      // Récupérer le token depuis la session pour l'authentification
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("🔐 Session récupérée:", session ? "Oui" : "Non");

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
        console.log("✅ Token d'authentification ajouté aux headers");
      } else {
        console.warn("⚠️ Aucun token d'authentification disponible");
      }

      console.log("📤 Envoi de la requête POST vers /api/payments/cancel");
      const response = await fetch("/api/payments/cancel", {
        method: "POST",
        credentials: "include",
        headers,
        // IMPORTANT: beaucoup de routes Next font `await req.json()`.
        // Si le body est vide, `req.json()` peut throw => 400.
        body: JSON.stringify({}),
      });

      console.log("📥 Réponse reçue, status:", response.status);

      let data: any = null;
      let rawText: string | null = null;

      try {
        // Certaines réponses d'erreur ne sont pas en JSON
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          data = await response.json();
        } else {
          rawText = await response.text();
        }
        console.log("📦 Données reçues:", data ?? rawText);
      } catch (parseError) {
        console.error("❌ Erreur lors du parsing de la réponse:", parseError);
        // On retente en texte pour garder un message utile
        try {
          rawText = await response.text();
          console.log("📦 Réponse (texte) reçue:", rawText);
        } catch {
          // ignore
        }
        throw new Error(
          `Erreur ${response.status}: Impossible de lire la réponse du serveur`
        );
      }

      if (!response.ok) {
        console.error("❌ Erreur HTTP:", response.status, data);
        throw new Error(
          (data && (data.error || data.message)) ||
            rawText ||
            `Erreur ${response.status}: Impossible d'annuler l'abonnement`
        );
      }

      console.log("✅ Abonnement annulé avec succès");
      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      console.error("❌ Erreur lors de l'annulation de l'abonnement:", err);
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
