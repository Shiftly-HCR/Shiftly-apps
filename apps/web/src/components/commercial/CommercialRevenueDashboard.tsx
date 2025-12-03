"use client";

import { YStack, XStack } from "tamagui";
import { colors } from "@shiftly/ui";
import { Euro, TrendingUp, Calendar, Percent } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { RevenuePieChart } from "./RevenuePieChart";
import { ProgressionScale } from "./ProgressionScale";

/**
 * Composant Dashboard de rémunération du Commercial
 * Affiche les métriques de revenus et un graphique en camembert
 */
export function CommercialRevenueDashboard() {
  // Données en dur pour l'instant
  const metrics = {
    subscriptionProfit: 1250, // Bénéfice sur les abonnements (€)
    freelancePercentage: 4, // Pourcentage sur les tarifs journaliers (%)
    mrr: 4500, // Monthly Recurring Revenue (€)
  };

  // Calcul de l'ARR : MRR * 12
  const arr = metrics.mrr * 12;

  // Données pour l'échelle de progression (primes basées sur le CA)
  // CA actuel (en dur pour l'instant)
  const currentRevenue = 12500; // Chiffre d'affaires actuel du commercial (€)

  // Seuils de CA pour débloquer les primes
  const bonusTiers = [
    { threshold: 5000, bonus: 200, label: "Niveau 1" },
    { threshold: 10000, bonus: 500, label: "Niveau 2" },
    { threshold: 20000, bonus: 800, label: "Niveau 3" },
    { threshold: 30000, bonus: 1000, label: "Niveau 4" },
  ];

  // Calculer le total des primes débloquées
  const totalBonuses = bonusTiers
    .filter((tier) => currentRevenue >= tier.threshold)
    .reduce((sum, tier) => sum + tier.bonus, 0);

  // Données pour le graphique pie chart (bénéfice total mensuel)
  // Couleurs améliorées pour plus de lisibilité et de contraste
  const monthlyRevenueData = [
    {
      name: "Abonnements",
      value: metrics.subscriptionProfit,
      color: colors.shiftlyViolet, // #782478 - Violet principal
    },
    {
      name: "Commissions freelances",
      value: 850,
      color: "#10B981", // Vert émeraude - Bon contraste
    },
    {
      name: "Autres revenus",
      value: 400,
      color: "#EF4444", // Rouge vif - Très contrasté
    },
    {
      name: "Primes",
      value: totalBonuses,
      color: "#F59E0B", // Orange/Ambre - Couleur distincte
    },
  ];

  return (
    <YStack gap="$6">
      {/* Métriques en cartes */}
      <XStack gap="$4" flexWrap="wrap">
        <MetricCard
          icon={Euro}
          iconColor={colors.shiftlyViolet}
          iconBackgroundColor={`${colors.shiftlyViolet}20`}
          label="Bénéfice abonnements"
          value={`${metrics.subscriptionProfit.toLocaleString("fr-FR")}€`}
          subtitle="Ce mois-ci"
        />
        <MetricCard
          icon={Percent}
          iconColor="#10B981"
          iconBackgroundColor="#10B98120"
          label="Commission freelances"
          value={`${metrics.freelancePercentage}%`}
          subtitle="Sur les tarifs journaliers"
        />
        <MetricCard
          icon={TrendingUp}
          iconColor="#3B82F6"
          iconBackgroundColor="#3B82F620"
          label="MRR"
          value={`${metrics.mrr.toLocaleString("fr-FR")}€`}
          subtitle="Monthly Recurring Revenue"
        />
        <MetricCard
          icon={Calendar}
          iconColor="#F59E0B"
          iconBackgroundColor="#F59E0B20"
          label="ARR"
          value={`${arr.toLocaleString("fr-FR")}€`}
          subtitle="Annual Recurring Revenue"
        />
      </XStack>

      {/* Graphique pie chart */}
      <RevenuePieChart data={monthlyRevenueData} />

      {/* Échelle de progression avec primes */}
      <ProgressionScale
        currentRevenue={currentRevenue}
        bonusTiers={bonusTiers}
      />
    </YStack>
  );
}
