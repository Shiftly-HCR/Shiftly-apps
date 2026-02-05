"use client";

/**
 * Hook pour gérer le paiement d'une mission
 */

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@shiftly/data";

export interface MissionPaymentStatus {
  id: string;
  status: "pending" | "paid" | "failed" | "refunded" | "released";
  amount: number;
  currency: string;
  paid_at?: string;
}

export interface UseMissionPaymentReturn {
  paymentStatus: MissionPaymentStatus | null;
  isLoading: boolean;
  isCheckingOut: boolean;
  isReleasing: boolean;
  isCheckingPayment: boolean;
  error: string | null;
  isPaid: boolean;
  refreshPaymentStatus: () => Promise<void>;
  fetchPaymentStatus: (missionId?: string) => Promise<void>;
  initiatePayment: () => Promise<string | null>;
  startCheckout: (missionId?: string) => Promise<string | null>;
  releaseFunds: (missionId?: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Hook pour gérer le paiement d'une mission côté recruteur
 */
export function useMissionPayment(
  defaultMissionId?: string
): UseMissionPaymentReturn {
  const [paymentStatus, setPaymentStatus] =
    useState<MissionPaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);
  const [isReleasing, setIsReleasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentStatus = useCallback(async (missionId?: string) => {
    const id = missionId ?? defaultMissionId;
    if (!id) return;

    setIsCheckingPayment(true);
    setError(null);

    try {
      const { data: payment, error: paymentError } = await supabase
        .from("mission_payments")
        .select("id, status, amount, currency, paid_at")
        .eq("mission_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (paymentError && paymentError.code !== "PGRST116") {
        console.error("Erreur récupération paiement:", paymentError);
        setError("Erreur lors de la vérification du paiement");
        return;
      }

      if (payment) {
        setPaymentStatus({
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          paid_at: payment.paid_at,
        });
      } else {
        setPaymentStatus(null);
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Une erreur est survenue");
    } finally {
      setIsCheckingPayment(false);
    }
  }, [defaultMissionId]);

  /**
   * Vérifie le statut de paiement de la mission
   */
  const refreshPaymentStatus = useCallback(async () => {
    if (!defaultMissionId) return;
    return fetchPaymentStatus(defaultMissionId);
  }, [defaultMissionId, fetchPaymentStatus]);

  // Charger le statut au montage
  useEffect(() => {
    if (defaultMissionId) {
      refreshPaymentStatus();
    }
  }, [defaultMissionId, refreshPaymentStatus]);

  /**
   * Initie le paiement de la mission via Stripe Checkout
   */
  const initiatePayment = useCallback(async (): Promise<string | null> => {
    if (!defaultMissionId) return null;

    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("Vous devez être connecté");
        return null;
      }

      const response = await fetch(
        `/api/missions/${defaultMissionId}/checkout`,
        {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la création du paiement");
        return null;
      }

      // Rafraîchir le statut après création
      await refreshPaymentStatus();

      return data.url;
    } catch (err) {
      console.error("Erreur:", err);
      setError("Une erreur est survenue");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [defaultMissionId, refreshPaymentStatus]);

  const startCheckout = useCallback(
    async (missionId?: string): Promise<string | null> => {
      const id = missionId ?? defaultMissionId;
      if (!id) return null;
      if (id === defaultMissionId) {
        return initiatePayment();
      }

      setIsLoading(true);
      setError(null);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setError("Vous devez être connecté");
          return null;
        }

        const response = await fetch(`/api/missions/${id}/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Erreur lors de la création du paiement");
          return null;
        }

        await fetchPaymentStatus(id);
        return data.url;
      } catch (err) {
        console.error("Erreur:", err);
        setError("Une erreur est survenue");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [defaultMissionId, fetchPaymentStatus, initiatePayment]
  );

  const releaseFunds = useCallback(
    async (missionId?: string) => {
      const id = missionId ?? defaultMissionId;
      if (!id) return { success: false, error: "Mission ID manquant" };

      setIsReleasing(true);
      setError(null);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setError("Vous devez être connecté");
          return { success: false, error: "Non connecté" };
        }

        const response = await fetch(`/api/missions/${id}/release`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Erreur lors de la libération des fonds");
          return { success: false, error: data.error };
        }

        await fetchPaymentStatus(id);
        return { success: true };
      } catch (err) {
        console.error("Erreur:", err);
        const errorMsg = "Une erreur est survenue";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsReleasing(false);
      }
    },
    [defaultMissionId, fetchPaymentStatus]
  );

  const isPaid = paymentStatus?.status === "paid";

  return {
    paymentStatus,
    isLoading,
    isCheckingOut: isLoading,
    isReleasing,
    isCheckingPayment,
    error,
    isPaid,
    refreshPaymentStatus,
    fetchPaymentStatus,
    initiatePayment,
    startCheckout,
    releaseFunds,
  };
}

/**
 * Hook pour libérer les fonds d'une mission
 */
export function useMissionReleaseFunds(missionId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const releaseFunds = useCallback(async () => {
    if (!missionId) return { success: false, error: "Mission ID manquant" };

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("Vous devez être connecté");
        return { success: false, error: "Non connecté" };
      }

      const response = await fetch(`/api/missions/${missionId}/release`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la libération des fonds");
        return { success: false, error: data.error };
      }

      setSuccess(true);
      return { success: true, transfers: data.transfers };
    } catch (err) {
      console.error("Erreur:", err);
      const errorMsg = "Une erreur est survenue";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [missionId]);

  return {
    releaseFunds,
    isLoading,
    error,
    success,
  };
}
