/**
 * Hook pour récupérer les données financières d'un commercial
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@shiftly/data";

export interface CommercialFinanceData {
  // Montants totaux
  totalCommissions: number; // Total des commissions reçues (en centimes)
  pendingCommissions: number; // Commissions en attente de libération
  
  // Statistiques par période
  commissionsThisMonth: number;
  commissionsLastMonth: number;
  
  // Nombre de missions
  totalMissions: number;
  missionsThisMonth: number;
  
  // MRR estimé (basé sur les missions récentes)
  estimatedMrr: number;
  
  // Détail des transfers récents
  recentTransfers: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    missionId: string;
    missionTitle?: string;
    createdAt: string;
  }>;
}

export interface UseCommercialFinanceReturn {
  isLoading: boolean;
  error: string | null;
  data: CommercialFinanceData | null;
  refresh: () => Promise<void>;
}

/**
 * Hook pour récupérer les statistiques financières d'un commercial
 */
export function useCommercialFinance(): UseCommercialFinanceReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CommercialFinanceData | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Vous devez être connecté");
        return;
      }

      // Dates pour les filtres
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // 1. Récupérer les transfers du commercial
      const { data: transfers, error: transfersError } = await supabase
        .from("mission_transfers")
        .select(`
          id,
          amount,
          currency,
          status,
          mission_id,
          created_at,
          missions:mission_id (title)
        `)
        .eq("destination_profile_id", user.id)
        .eq("type", "commercial_commission")
        .order("created_at", { ascending: false });

      if (transfersError) {
        console.error("Erreur récupération transfers:", transfersError);
        throw new Error("Erreur lors de la récupération des données");
      }

      // 2. Récupérer les finances où le commercial est rattaché (pour les commissions en attente)
      const { data: finances, error: financesError } = await supabase
        .from("mission_finance")
        .select(`
          id,
          commercial_fee_amount,
          created_at,
          mission_payments:mission_payment_id (status)
        `)
        .eq("commercial_id", user.id);

      if (financesError) {
        console.error("Erreur récupération finances:", financesError);
      }

      // Calculer les statistiques
      const allTransfers = transfers || [];
      const completedTransfers = allTransfers.filter(t => t.status === "created");
      
      // Total des commissions reçues
      const totalCommissions = completedTransfers.reduce(
        (sum, t) => sum + t.amount,
        0
      );

      // Commissions de ce mois
      const commissionsThisMonth = completedTransfers
        .filter(t => new Date(t.created_at) >= startOfMonth)
        .reduce((sum, t) => sum + t.amount, 0);

      // Commissions du mois dernier
      const commissionsLastMonth = completedTransfers
        .filter(t => {
          const date = new Date(t.created_at);
          return date >= startOfLastMonth && date <= endOfLastMonth;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      // Commissions en attente (finances avec payment status=paid mais pas de transfer)
      const allFinances = finances || [];
      const pendingFinances = allFinances.filter(f => {
        const payment = f.mission_payments as any;
        return payment?.status === "paid";
      });
      
      // Vérifier quelles finances ont déjà un transfer
      const transferMissionIds = new Set(allTransfers.map(t => t.mission_id));
      const pendingCommissions = pendingFinances
        .filter(f => !transferMissionIds.has(f.id))
        .reduce((sum, f) => sum + f.commercial_fee_amount, 0);

      // Nombre de missions
      const uniqueMissionIds = new Set(allTransfers.map(t => t.mission_id));
      const totalMissions = uniqueMissionIds.size;

      const missionsThisMonth = new Set(
        allTransfers
          .filter(t => new Date(t.created_at) >= startOfMonth)
          .map(t => t.mission_id)
      ).size;

      // MRR estimé (moyenne des 3 derniers mois * 1 mois)
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      const last3MonthsCommissions = completedTransfers
        .filter(t => new Date(t.created_at) >= threeMonthsAgo)
        .reduce((sum, t) => sum + t.amount, 0);
      const estimatedMrr = Math.round(last3MonthsCommissions / 3);

      // Transfers récents (10 derniers)
      const recentTransfers = allTransfers.slice(0, 10).map(t => ({
        id: t.id,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        missionId: t.mission_id,
        missionTitle: (t.missions as any)?.title,
        createdAt: t.created_at,
      }));

      setData({
        totalCommissions,
        pendingCommissions,
        commissionsThisMonth,
        commissionsLastMonth,
        totalMissions,
        missionsThisMonth,
        estimatedMrr,
        recentTransfers,
      });
    } catch (err) {
      console.error("Erreur useCommercialFinance:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    isLoading,
    error,
    data,
    refresh: fetchData,
  };
}
