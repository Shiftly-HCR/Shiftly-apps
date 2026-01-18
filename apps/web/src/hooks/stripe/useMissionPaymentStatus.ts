"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@shiftly/data";

export type MissionPaymentStatus =
  | "unpaid"
  | "pending"
  | "received"
  | "distributed"
  | "errored";

export interface MissionPaymentStatusInfo {
  status: MissionPaymentStatus;
  amount: number | null; // En centimes
  freelancerAmount: number | null; // Montant que le freelance recevra (85%)
  paidAt?: string | null;
  distributedAt?: string | null;
  canRelease: boolean; // Peut libérer les fonds
}

/**
 * Hook pour récupérer le statut de paiement d'une mission
 * Utilisable sur la page de détail de mission
 */
export function useMissionPaymentStatus(
  missionId: string | null,
  isRecruiter: boolean = false
) {
  const [paymentStatus, setPaymentStatus] =
    useState<MissionPaymentStatusInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentStatus = useCallback(async () => {
    if (!missionId) {
      setPaymentStatus(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Récupérer le paiement de la mission
      const { data: payment, error: paymentError } = await supabase
        .from("mission_payments")
        .select("id, status, amount, paid_at, distributed_at")
        .eq("mission_id", missionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (paymentError) {
        console.error("Erreur récupération paiement:", paymentError);
        setPaymentStatus(null);
        return;
      }

      if (!payment) {
        setPaymentStatus({
          status: "unpaid",
          amount: null,
          freelancerAmount: null,
          canRelease: false,
        });
        return;
      }

      let status: MissionPaymentStatus = "unpaid";
      switch (payment.status) {
        case "pending":
          status = "pending";
          break;
        case "paid":
        case "received":
          status = "received";
          break;
        case "distributed":
        case "released":
          status = "distributed";
          break;
        case "errored":
          status = "errored";
          break;
        default:
          status = "unpaid";
      }

      // Calculer le montant que le freelance recevra (85%)
      const freelancerAmount = payment.amount
        ? Math.floor((payment.amount * 85) / 100)
        : null;

      // Le recruteur peut libérer les fonds si le statut est "received"
      const canRelease = isRecruiter && status === "received";

      setPaymentStatus({
        status,
        amount: payment.amount,
        freelancerAmount,
        paidAt: payment.paid_at,
        distributedAt: payment.distributed_at,
        canRelease,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors du chargement";
      console.error("Erreur lors de la récupération du statut de paiement:", err);
      setError(errorMessage);
      setPaymentStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [missionId, isRecruiter]);

  useEffect(() => {
    fetchPaymentStatus();
  }, [fetchPaymentStatus]);

  // Libérer les fonds
  const releaseFunds = useCallback(async () => {
    if (!missionId || !paymentStatus?.canRelease) {
      return { success: false, error: "Action non autorisée" };
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/missions/${missionId}/release`, {
        method: "POST",
        headers,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la libération des fonds");
      }

      // Rafraîchir le statut
      await fetchPaymentStatus();

      return {
        success: data.success,
        paymentStatus: data.paymentStatus,
        summary: data.summary,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la libération";
      console.error("Erreur lors de la libération des fonds:", err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  }, [missionId, paymentStatus?.canRelease, fetchPaymentStatus]);

  return {
    paymentStatus,
    isLoading,
    isProcessing,
    error,
    releaseFunds,
    refreshPaymentStatus: fetchPaymentStatus,
  };
}
