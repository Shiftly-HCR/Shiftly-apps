"use client";

import { useState, useCallback, useEffect } from "react";
import type { ConversationWithDetails } from "@shiftly/data";
import { supabase } from "@shiftly/data";

// Statuts de paiement mis à jour
export type MissionPaymentStatus =
  | "unpaid" // Pas encore payé
  | "pending" // Checkout en cours
  | "received" // Paiement reçu, en attente de distribution
  | "distributed" // Fonds distribués
  | "errored"; // Erreur lors de la distribution

export interface MissionPaymentInfo {
  status: MissionPaymentStatus;
  amount: number | null; // En centimes
  missionId: string;
  missionTitle: string;
  canPay: boolean; // Peut lancer le checkout
  canRelease: boolean; // Peut libérer les fonds
  paymentId?: string;
  freelancerAmount?: number | null; // Montant que le freelance recevra (85%)
}

/**
 * Hook pour gérer le paiement d'une mission depuis une conversation
 * Affiche le bouton de paiement pour le recruteur
 * Affiche le statut du paiement pour le freelance
 */
export function useMissionPaymentInConversation(
  conversation: ConversationWithDetails | null,
  currentUserId: string
) {
  const [paymentInfo, setPaymentInfo] = useState<MissionPaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier le rôle de l'utilisateur dans la conversation
  const isRecruiter = conversation?.recruiter_id === currentUserId;
  const isFreelance = conversation?.freelance_id === currentUserId;

  // Charger les informations de paiement (pour recruteur ET freelance)
  const fetchPaymentInfo = useCallback(async () => {
    if (!conversation?.mission?.id || (!isRecruiter && !isFreelance)) {
      setPaymentInfo(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const missionId = conversation.mission.id;

      // Récupérer les détails de la mission (notamment total_salary)
      const { data: mission, error: missionError } = await supabase
        .from("missions")
        .select("id, title, total_salary, daily_rate, hourly_rate")
        .eq("id", missionId)
        .single();

      if (missionError || !mission) {
        console.error("Erreur récupération mission:", missionError);
        setPaymentInfo(null);
        return;
      }

      // Calculer le montant (en centimes) - Priorité au total_salary
      let amount: number | null = null;
      if (mission.total_salary) {
        // Utiliser le salaire total de la mission
        amount = Math.round(mission.total_salary * 100);
      } else if (mission.daily_rate) {
        // Sinon utiliser le TJM (pour une journée)
        amount = Math.round(mission.daily_rate * 100);
      } else if (mission.hourly_rate) {
        // Sinon utiliser le taux horaire (pour 8h par défaut)
        amount = Math.round(mission.hourly_rate * 8 * 100);
      }

      // Vérifier s'il existe un paiement pour cette mission
      const { data: payment, error: paymentError } = await supabase
        .from("mission_payments")
        .select("id, status, amount")
        .eq("mission_id", missionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let status: MissionPaymentStatus = "unpaid";
      let paymentId: string | undefined;

      if (payment && !paymentError) {
        paymentId = payment.id;
        switch (payment.status) {
          case "pending":
            status = "pending";
            break;
          case "paid":
          case "received": // Nouveau statut: paiement reçu
            status = "received";
            break;
          case "distributed": // Nouveau statut: fonds distribués
          case "released": // Compatibilité ancienne
            status = "distributed";
            break;
          case "errored": // Nouveau statut: erreur
            status = "errored";
            break;
          default:
            status = "unpaid";
        }
        // Utiliser le montant du paiement si disponible
        if (payment.amount) {
          amount = payment.amount;
        }
      }

      // Le recruteur peut payer si la mission n'est pas encore payée
      const canPay =
        isRecruiter && status === "unpaid" && amount !== null && amount > 0;

      // Le recruteur peut libérer les fonds si le paiement est reçu
      const canRelease = isRecruiter && status === "received";

      // Calculer le montant que le freelance recevra (85%)
      const freelancerAmount = amount ? Math.floor((amount * 85) / 100) : null;

      setPaymentInfo({
        status,
        amount,
        missionId,
        missionTitle: mission.title || conversation.mission.title,
        canPay,
        canRelease,
        paymentId,
        freelancerAmount,
      });
    } catch (err: any) {
      console.error("Erreur lors de la récupération des infos de paiement:", err);
      setError(err.message || "Erreur lors du chargement");
      setPaymentInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [conversation?.mission?.id, isRecruiter, isFreelance]);

  // Charger les informations au montage et quand la conversation change
  useEffect(() => {
    fetchPaymentInfo();
  }, [fetchPaymentInfo]);

  // Lancer le checkout Stripe
  const startCheckout = useCallback(async () => {
    if (!paymentInfo?.canPay || !conversation?.mission?.id) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Récupérer le token de session pour l'authentification
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Ajouter le token d'autorisation si disponible
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `/api/missions/${conversation.mission.id}/checkout`,
        {
          method: "POST",
          headers,
          credentials: "include", // Envoyer les cookies de session
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création du checkout");
      }

      // Rediriger vers Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout non reçue");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors du paiement";
      console.error("Erreur lors du checkout:", err);
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [paymentInfo?.canPay, conversation?.mission?.id]);

  // Libérer les fonds (distribuer aux freelance/commercial)
  const releaseFunds = useCallback(async () => {
    if (!paymentInfo?.canRelease || !conversation?.mission?.id) {
      return { success: false, error: "Action non autorisée" };
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Récupérer le token de session pour l'authentification
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `/api/missions/${conversation.mission.id}/release`,
        {
          method: "POST",
          headers,
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la libération des fonds"
        );
      }

      // Rafraîchir les informations de paiement
      await fetchPaymentInfo();

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
  }, [paymentInfo?.canRelease, conversation?.mission?.id, fetchPaymentInfo]);

  return {
    isRecruiter,
    isFreelance,
    paymentInfo,
    isLoading,
    isProcessing,
    error,
    startCheckout,
    releaseFunds,
    refreshPaymentInfo: fetchPaymentInfo,
  };
}
