"use client";

/**
 * Hook pour gérer l'onboarding Stripe Connect
 */

import { useState, useCallback } from "react";
import { supabase } from "@shiftly/data";

export type ConnectOnboardingStatus =
  | "not_started"
  | "pending"
  | "complete"
  | "restricted";

export interface ConnectStatus {
  stripeAccountId: string | null;
  onboardingStatus: ConnectOnboardingStatus;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  requirementsDue: string[];
}

export interface UseConnectOnboardingReturn {
  status: ConnectStatus | null;
  connectStatus: ConnectStatus | null;
  isLoading: boolean;
  isCreatingAccount: boolean;
  isCreatingLink: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
  fetchConnectStatus: () => Promise<void>;
  startOnboarding: () => Promise<string | null>;
  continueOnboarding: () => Promise<string | null>;
}

/**
 * Hook pour gérer l'onboarding Stripe Connect
 * Utilisable par les freelances et commerciaux
 */
export function useConnectOnboarding(): UseConnectOnboardingReturn {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Rafraîchit le statut Connect depuis le profil
   */
  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Non connecté");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          `
          stripe_account_id,
          connect_onboarding_status,
          connect_payouts_enabled,
          connect_charges_enabled,
          connect_requirements_due
        `
        )
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Erreur récupération profil:", profileError);
        setError("Erreur lors de la récupération du statut");
        return;
      }

      const requirements = profile.connect_requirements_due?.requirements || [];

      setStatus({
        stripeAccountId: profile.stripe_account_id,
        onboardingStatus: profile.connect_onboarding_status || "not_started",
        payoutsEnabled: profile.connect_payouts_enabled || false,
        chargesEnabled: profile.connect_charges_enabled || false,
        requirementsDue: Array.isArray(requirements) ? requirements : [],
      });
    } catch (err) {
      console.error("Erreur:", err);
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Démarre l'onboarding Connect
   * Crée le compte si nécessaire et retourne l'URL Stripe
   */
  const startOnboarding = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("Non connecté");
        return null;
      }

      const response = await fetch("/api/connect/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la création du lien");
        return null;
      }

      // Rafraîchir le statut après création du compte
      await refreshStatus();

      return data.url;
    } catch (err) {
      console.error("Erreur:", err);
      setError("Une erreur est survenue");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [refreshStatus]);

  return {
    status,
    connectStatus: status,
    isLoading,
    isCreatingAccount: isLoading,
    isCreatingLink: isLoading,
    error,
    refreshStatus,
    fetchConnectStatus: refreshStatus,
    startOnboarding,
    continueOnboarding: startOnboarding,
  };
}
