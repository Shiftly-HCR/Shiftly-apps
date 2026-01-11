/**
 * Hook pour récupérer les statistiques financières du commercial
 */

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@shiftly/data";

export interface CommercialFinanceStats {
  totalEstablishments: number;
  totalMissionsWithCommission: number;
  totalCommissionEarned: number; // En centimes
  totalCommissionPaid: number; // En centimes
  pendingCommission: number; // En centimes
  monthlyCommission: number; // Ce mois-ci en centimes
}

export interface UseCommercialStatsReturn {
  stats: CommercialFinanceStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook pour récupérer les statistiques financières du commercial connecté
 */
export function useCommercialStats(): UseCommercialStatsReturn {
  const [stats, setStats] = useState<CommercialFinanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Non connecté");
        setStats(null);
        return;
      }

      // Récupérer le nombre d'établissements rattachés
      const { count: establishmentsCount, error: estError } = await supabase
        .from("establishments")
        .select("*", { count: "exact", head: true })
        .eq("commercial_id", user.id);

      if (estError) {
        console.error("Erreur établissements:", estError);
      }

      // Récupérer les finances du commercial
      const { data: finances, error: financeError } = await supabase
        .from("mission_finance")
        .select("commercial_fee_amount, created_at")
        .eq("commercial_id", user.id);

      if (financeError) {
        console.error("Erreur finances:", financeError);
      }

      // Récupérer les transferts vers le commercial
      const { data: transfers, error: transferError } = await supabase
        .from("mission_transfers")
        .select("amount, status, created_at")
        .eq("destination_profile_id", user.id)
        .eq("type", "commercial_commission");

      if (transferError) {
        console.error("Erreur transferts:", transferError);
      }

      // Calculer les statistiques
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalCommissionEarned = (finances || []).reduce(
        (sum, f) => sum + (f.commercial_fee_amount || 0),
        0
      );

      const totalCommissionPaid = (transfers || [])
        .filter((t) => t.status === "created")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const pendingCommission = totalCommissionEarned - totalCommissionPaid;

      const monthlyCommission = (finances || [])
        .filter((f) => new Date(f.created_at) >= startOfMonth)
        .reduce((sum, f) => sum + (f.commercial_fee_amount || 0), 0);

      setStats({
        totalEstablishments: establishmentsCount || 0,
        totalMissionsWithCommission: (finances || []).length,
        totalCommissionEarned,
        totalCommissionPaid,
        pendingCommission,
        monthlyCommission,
      });
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors de la récupération des statistiques");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    stats,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Convertit des centimes en euros formatés
 */
export function formatCentsToEuros(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
