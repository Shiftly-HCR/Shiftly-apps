"use client";

import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { Euro, TrendingUp, Calendar, Percent, Loader2 } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { RevenuePieChart } from "./RevenuePieChart";
import { ProgressionScale } from "./ProgressionScale";
import { useCommercialStats, formatCentsToEuros } from "@/hooks/commercial";

/**
 * Composant Dashboard de rémunération du Commercial
 * Affiche les métriques de revenus et un graphique en camembert
 * Utilise les données réelles de mission_finance et mission_transfers
 */
export function CommercialRevenueDashboard() {
  const { stats, isLoading, error } = useCommercialStats();

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <YStack padding="$6" alignItems="center" justifyContent="center">
        <Loader2 size={32} color={colors.shiftlyViolet} className="animate-spin" />
        <Text marginTop="$2" color={colors.gray500}>
          Chargement des statistiques...
        </Text>
      </YStack>
    );
  }

  // Afficher une erreur si nécessaire
  if (error) {
    return (
      <YStack padding="$6" alignItems="center">
        <Text color={colors.shiftlyMarron}>{error}</Text>
      </YStack>
    );
  }

  // Convertir les centimes en euros pour l'affichage
  const totalCommissionEuros = stats ? stats.totalCommissionEarned / 100 : 0;
  const monthlyCommissionEuros = stats ? stats.monthlyCommission / 100 : 0;
  const paidCommissionEuros = stats ? stats.totalCommissionPaid / 100 : 0;
  const pendingCommissionEuros = stats ? stats.pendingCommission / 100 : 0;

  // Pourcentage de commission (fixe à 6%)
  const commissionPercentage = 6;

  // Calculer une estimation du MRR basée sur les commissions mensuelles
  // (pour simplifier, on utilise les commissions du mois comme proxy)
  const estimatedMrr = monthlyCommissionEuros;
  const estimatedArr = estimatedMrr * 12;

  // Données pour l'échelle de progression (primes basées sur le CA total)
  const currentRevenue = totalCommissionEuros;

  // Seuils de CA pour débloquer les primes (en euros)
  const bonusTiers = [
    { threshold: 500, bonus: 50, label: "Niveau 1" },
    { threshold: 1000, bonus: 100, label: "Niveau 2" },
    { threshold: 2500, bonus: 200, label: "Niveau 3" },
    { threshold: 5000, bonus: 400, label: "Niveau 4" },
  ];

  // Calculer le total des primes débloquées
  const totalBonuses = bonusTiers
    .filter((tier) => currentRevenue >= tier.threshold)
    .reduce((sum, tier) => sum + tier.bonus, 0);

  // Données pour le graphique pie chart (répartition des revenus)
  const monthlyRevenueData = [
    {
      name: "Commissions payées",
      value: paidCommissionEuros,
      color: colors.shiftlyViolet,
    },
    {
      name: "Commissions en attente",
      value: pendingCommissionEuros,
      color: "#F59E0B",
    },
    {
      name: "Primes débloquées",
      value: totalBonuses,
      color: "#10B981",
    },
  ].filter((item) => item.value > 0); // Filtrer les valeurs nulles

  return (
    <YStack gap="$6">
      {/* Métriques en cartes */}
      <XStack gap="$4" flexWrap="wrap">
        <MetricCard
          icon={Euro}
          iconColor={colors.shiftlyViolet}
          iconBackgroundColor={`${colors.shiftlyViolet}20`}
          label="Commissions ce mois"
          value={`${monthlyCommissionEuros.toLocaleString("fr-FR")}€`}
          subtitle="Ce mois-ci"
        />
        <MetricCard
          icon={Percent}
          iconColor="#10B981"
          iconBackgroundColor="#10B98120"
          label="Taux de commission"
          value={`${commissionPercentage}%`}
          subtitle="Sur les paiements de missions"
        />
        <MetricCard
          icon={TrendingUp}
          iconColor="#3B82F6"
          iconBackgroundColor="#3B82F620"
          label="Total gagné"
          value={`${totalCommissionEuros.toLocaleString("fr-FR")}€`}
          subtitle="Depuis le début"
        />
        <MetricCard
          icon={Calendar}
          iconColor="#F59E0B"
          iconBackgroundColor="#F59E0B20"
          label="En attente"
          value={`${pendingCommissionEuros.toLocaleString("fr-FR")}€`}
          subtitle="À recevoir"
        />
      </XStack>

      {/* Informations supplémentaires */}
      {stats && (
        <XStack gap="$4" flexWrap="wrap">
          <YStack
            backgroundColor="white"
            borderRadius="$3"
            padding="$4"
            flex={1}
            minWidth={200}
            borderWidth={1}
            borderColor={colors.gray200}
          >
            <Text fontSize={14} color={colors.gray500} marginBottom="$1">
              Établissements rattachés
            </Text>
            <Text fontSize={24} fontWeight="700" color={colors.gray900}>
              {stats.totalEstablishments}
            </Text>
          </YStack>
          <YStack
            backgroundColor="white"
            borderRadius="$3"
            padding="$4"
            flex={1}
            minWidth={200}
            borderWidth={1}
            borderColor={colors.gray200}
          >
            <Text fontSize={14} color={colors.gray500} marginBottom="$1">
              Missions avec commission
            </Text>
            <Text fontSize={24} fontWeight="700" color={colors.gray900}>
              {stats.totalMissionsWithCommission}
            </Text>
          </YStack>
        </XStack>
      )}

      {/* Graphique pie chart - seulement s'il y a des données */}
      {monthlyRevenueData.length > 0 && (
        <RevenuePieChart data={monthlyRevenueData} />
      )}

      {/* Échelle de progression avec primes */}
      <ProgressionScale
        currentRevenue={currentRevenue}
        bonusTiers={bonusTiers}
      />
    </YStack>
  );
}
