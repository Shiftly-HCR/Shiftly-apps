"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@shiftly/data";

export type MissionPaymentStatus = "unpaid" | "pending" | "paid" | "released";

export interface MissionPaymentStatusInfo {
  status: MissionPaymentStatus;
  amount: number | null; // En centimes
  freelancerAmount: number | null; // Montant que le freelance recevra (85%)
  paidAt?: string | null;
}

/**
 * Hook pour récupérer le statut de paiement d'une mission
 * Utilisable sur la page de détail de mission
 */
export function useMissionPaymentStatus(missionId: string | null) {
  const [paymentStatus, setPaymentStatus] = useState<MissionPaymentStatusInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
        .select("id, status, amount, paid_at")
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
        });
        return;
      }

      let status: MissionPaymentStatus = "unpaid";
      switch (payment.status) {
        case "pending":
          status = "pending";
          break;
        case "paid":
          status = "paid";
          break;
        case "released":
          status = "released";
          break;
        default:
          status = "unpaid";
      }

      // Calculer le montant que le freelance recevra (85%)
      const freelancerAmount = payment.amount ? Math.floor((payment.amount * 85) / 100) : null;

      setPaymentStatus({
        status,
        amount: payment.amount,
        freelancerAmount,
        paidAt: payment.paid_at,
      });
    } catch (err: any) {
      console.error("Erreur lors de la récupération du statut de paiement:", err);
      setError(err.message || "Erreur lors du chargement");
      setPaymentStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [missionId]);

  useEffect(() => {
    fetchPaymentStatus();
  }, [fetchPaymentStatus]);

  return {
    paymentStatus,
    isLoading,
    error,
    refreshPaymentStatus: fetchPaymentStatus,
  };
}
