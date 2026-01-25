"use client";

/**
 * Hook pour gérer le paiement d'une mission
 */

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@shiftly/data";

export interface MissionPaymentStatus {
  id: string;
  status: "pending" | "paid" | "failed" | "refunded";
  amount: number;
  currency: string;
  paid_at?: string;
}

export interface UseMissionPaymentReturn {
  paymentStatus: MissionPaymentStatus | null;
  isLoading: boolean;
  isCheckingPayment: boolean;
  error: string | null;
  isPaid: boolean;
  refreshPaymentStatus: () => Promise<void>;
  initiatePayment: () => Promise<string | null>;
}

/**
 * Hook pour gérer le paiement d'une mission côté recruteur
 */
export function useMissionPayment(missionId: string): UseMissionPaymentReturn {
  const [paymentStatus, setPaymentStatus] =
    useState<MissionPaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Vérifie le statut de paiement de la mission
   */
  const refreshPaymentStatus = useCallback(async () => {
    if (!missionId) return;

    setIsCheckingPayment(true);
    setError(null);

    try {
      const { data: payment, error: paymentError } = await supabase
        .from("mission_payments")
        .select("id, status, amount, currency, paid_at")
        .eq("mission_id", missionId)
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
  }, [missionId]);

  // Charger le statut au montage
  useEffect(() => {
    refreshPaymentStatus();
  }, [refreshPaymentStatus]);

  /**
   * Initie le paiement de la mission via Stripe Checkout
   */
  const initiatePayment = useCallback(async (): Promise<string | null> => {
    if (!missionId) return null;

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

      const response = await fetch(`/api/missions/${missionId}/checkout`, {
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
  }, [missionId, refreshPaymentStatus]);

  const isPaid = paymentStatus?.status === "paid";

  return {
    paymentStatus,
    isLoading,
    isCheckingPayment,
    error,
    isPaid,
    refreshPaymentStatus,
    initiatePayment,
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
