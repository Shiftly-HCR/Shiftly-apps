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
  canReportDispute: boolean; // Peut signaler un problème
  hasDispute: boolean; // Un litige est en cours
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
        .select("id, status, amount, paid_at, distributed_at, has_dispute")
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
          canReportDispute: false,
          hasDispute: false,
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

      const hasDispute = payment.has_dispute || false;

      // Le recruteur peut signaler un problème si le statut est "received" et pas de litige
      const canReportDispute = isRecruiter && status === "received" && !hasDispute;

      setPaymentStatus({
        status,
        amount: payment.amount,
        freelancerAmount,
        paidAt: payment.paid_at,
        distributedAt: payment.distributed_at,
        canReportDispute,
        hasDispute,
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

  // Signaler un problème
  const reportDispute = useCallback(
    async (reason: string, description?: string) => {
      if (!missionId || !paymentStatus?.canReportDispute) {
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

        const response = await fetch(`/api/missions/${missionId}/dispute`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ reason, description }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erreur lors du signalement");
        }

        // Rafraîchir le statut
        await fetchPaymentStatus();

        return {
          success: data.success,
          dispute: data.dispute,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur lors du signalement";
        console.error("Erreur lors du signalement:", err);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsProcessing(false);
      }
    },
    [missionId, paymentStatus?.canReportDispute, fetchPaymentStatus]
  );

  return {
    paymentStatus,
    isLoading,
    isProcessing,
    error,
    reportDispute,
    refreshPaymentStatus: fetchPaymentStatus,
  };
}
