"use client";

import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import {
  Euro,
  TrendingUp,
  Calendar,
  Percent,
  Trophy,
  Star,
} from "lucide-react";
import dynamic from "next/dynamic";

// Import dynamique du PieChart pour éviter les erreurs SSR
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), {
  ssr: false,
});
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), {
  ssr: false,
});
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

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
    { threshold: 5000, bonus: 200, label: "Niveau 1", icon: Star },
    { threshold: 10000, bonus: 500, label: "Niveau 2", icon: Star },
    { threshold: 20000, bonus: 800, label: "Niveau 3", icon: Trophy },
    { threshold: 30000, bonus: 1000, label: "Niveau 4", icon: Trophy },
  ];

  // Trouver le niveau actuel et le prochain
  const currentTier = bonusTiers.findIndex(
    (tier) => currentRevenue < tier.threshold
  );
  const activeTierIndex =
    currentTier === -1 ? bonusTiers.length - 1 : currentTier - 1;
  const nextTier = currentTier === -1 ? null : bonusTiers[currentTier];
  const currentTierData =
    activeTierIndex >= 0 ? bonusTiers[activeTierIndex] : null;

  // Calculer le pourcentage de progression vers le prochain niveau
  const getProgressPercentage = () => {
    if (!nextTier) return 100; // Tous les niveaux débloqués
    if (activeTierIndex < 0) {
      // Aucun niveau débloqué, progression vers le premier
      return Math.min(100, (currentRevenue / nextTier.threshold) * 100);
    }
    const previousThreshold =
      activeTierIndex >= 0 ? bonusTiers[activeTierIndex].threshold : 0;
    const progress = currentRevenue - previousThreshold;
    const needed = nextTier.threshold - previousThreshold;
    return Math.min(100, (progress / needed) * 100);
  };

  const progressPercentage = getProgressPercentage();

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

  const totalMonthlyRevenue = monthlyRevenueData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <YStack gap="$6">
      {/* Métriques en cartes */}
      <XStack gap="$4" flexWrap="wrap">
        {/* Carte 1: Bénéfice sur les abonnements */}
        <YStack
          flex={1}
          minWidth={280}
          backgroundColor="white"
          borderRadius="$4"
          padding="$5"
          borderWidth={1}
          borderColor={colors.gray200}
          gap="$3"
        >
          <XStack alignItems="center" gap="$2" marginBottom="$2">
            <YStack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor={`${colors.shiftlyViolet}20`}
              alignItems="center"
              justifyContent="center"
            >
              <Euro size={20} color={colors.shiftlyViolet} />
            </YStack>
            <Text fontSize={14} color={colors.gray500} fontWeight="500">
              Bénéfice abonnements
            </Text>
          </XStack>
          <Text fontSize={32} fontWeight="700" color={colors.gray900}>
            {metrics.subscriptionProfit.toLocaleString("fr-FR")}€
          </Text>
          <Text fontSize={12} color={colors.gray500}>
            Ce mois-ci
          </Text>
        </YStack>

        {/* Carte 2: Pourcentage freelances */}
        <YStack
          flex={1}
          minWidth={280}
          backgroundColor="white"
          borderRadius="$4"
          padding="$5"
          borderWidth={1}
          borderColor={colors.gray200}
          gap="$3"
        >
          <XStack alignItems="center" gap="$2" marginBottom="$2">
            <YStack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor={`#10B98120`}
              alignItems="center"
              justifyContent="center"
            >
              <Percent size={20} color="#10B981" />
            </YStack>
            <Text fontSize={14} color={colors.gray500} fontWeight="500">
              Commission freelances
            </Text>
          </XStack>
          <Text fontSize={32} fontWeight="700" color={colors.gray900}>
            {metrics.freelancePercentage}%
          </Text>
          <Text fontSize={12} color={colors.gray500}>
            Sur les tarifs journaliers
          </Text>
        </YStack>

        {/* Carte 3: MRR */}
        <YStack
          flex={1}
          minWidth={280}
          backgroundColor="white"
          borderRadius="$4"
          padding="$5"
          borderWidth={1}
          borderColor={colors.gray200}
          gap="$3"
        >
          <XStack alignItems="center" gap="$2" marginBottom="$2">
            <YStack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor={`#3B82F620`}
              alignItems="center"
              justifyContent="center"
            >
              <TrendingUp size={20} color="#3B82F6" />
            </YStack>
            <Text fontSize={14} color={colors.gray500} fontWeight="500">
              MRR
            </Text>
          </XStack>
          <Text fontSize={32} fontWeight="700" color={colors.gray900}>
            {metrics.mrr.toLocaleString("fr-FR")}€
          </Text>
          <Text fontSize={12} color={colors.gray500}>
            Monthly Recurring Revenue
          </Text>
        </YStack>

        {/* Carte 4: ARR */}
        <YStack
          flex={1}
          minWidth={280}
          backgroundColor="white"
          borderRadius="$4"
          padding="$5"
          borderWidth={1}
          borderColor={colors.gray200}
          gap="$3"
        >
          <XStack alignItems="center" gap="$2" marginBottom="$2">
            <YStack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor={`#F59E0B20`}
              alignItems="center"
              justifyContent="center"
            >
              <Calendar size={20} color="#F59E0B" />
            </YStack>
            <Text fontSize={14} color={colors.gray500} fontWeight="500">
              ARR
            </Text>
          </XStack>
          <Text fontSize={32} fontWeight="700" color={colors.gray900}>
            {arr.toLocaleString("fr-FR")}€
          </Text>
          <Text fontSize={12} color={colors.gray500}>
            Annual Recurring Revenue
          </Text>
        </YStack>
      </XStack>

      {/* Graphique pie chart */}
      <YStack
        backgroundColor="white"
        borderRadius="$4"
        padding="$6"
        borderWidth={1}
        borderColor={colors.gray200}
        gap="$4"
      >
        <YStack gap="$2">
          <Text fontSize={20} fontWeight="600" color={colors.gray900}>
            Bénéfice total mensuel
          </Text>
          <Text fontSize={14} color={colors.gray500}>
            Répartition des revenus par source
          </Text>
        </YStack>

        <XStack gap="$6" alignItems="center" flexWrap="wrap">
          {/* Graphique */}
          <YStack flex={1} minWidth={300} alignItems="center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={monthlyRevenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  dataKey="value"
                >
                  {monthlyRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => (
                    <span style={{ color: entry.color }}>
                      {value}: {entry.payload.value}€
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </YStack>

          {/* Total */}
          <YStack
            minWidth={200}
            alignItems="center"
            justifyContent="center"
            gap="$2"
          >
            <Text fontSize={14} color={colors.gray500}>
              Total mensuel
            </Text>
            <Text fontSize={40} fontWeight="700" color={colors.shiftlyViolet}>
              {totalMonthlyRevenue.toLocaleString("fr-FR")}€
            </Text>
          </YStack>
        </XStack>
      </YStack>

      {/* Échelle de progression avec primes */}
      <YStack
        backgroundColor="white"
        borderRadius="$4"
        padding="$6"
        borderWidth={1}
        borderColor={colors.gray200}
        gap="$4"
      >
        <YStack gap="$2">
          <Text fontSize={20} fontWeight="600" color={colors.gray900}>
            Échelle de progression
          </Text>
          <Text fontSize={14} color={colors.gray500}>
            Débloquez des primes en atteignant des objectifs de chiffre
            d'affaires
          </Text>
        </YStack>

        {/* Jauge de progression */}
        <YStack gap="$3">
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize={14} color={colors.gray500}>
              CA actuel: {currentRevenue.toLocaleString("fr-FR")}€
            </Text>
            {nextTier && (
              <Text fontSize={14} color={colors.gray500}>
                Prochain objectif: {nextTier.threshold.toLocaleString("fr-FR")}€
              </Text>
            )}
          </XStack>

          {/* Barre de progression */}
          <YStack gap="$2">
            <YStack
              height={24}
              backgroundColor={colors.gray200}
              borderRadius={12}
              overflow="visible"
              position="relative"
            >
              <YStack
                height="100%"
                width={`${progressPercentage}%`}
                backgroundColor={colors.shiftlyViolet}
                borderRadius={12}
                transition="width 0.3s ease"
              />
              {/* Marqueurs des niveaux avec primes en dessous */}
              <XStack
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                pointerEvents="none"
              >
                {bonusTiers.map((tier, index) => {
                  const percentage =
                    (tier.threshold /
                      bonusTiers[bonusTiers.length - 1].threshold) *
                    100;
                  const isUnlocked = currentRevenue >= tier.threshold;
                  return (
                    <YStack
                      key={index}
                      position="absolute"
                      left={`${percentage}%`}
                      alignItems="center"
                      transform={[{ translateX: -8 }]}
                      top={-2}
                    >
                      <YStack
                        width={16}
                        height={16}
                        borderRadius={8}
                        backgroundColor={
                          isUnlocked ? colors.shiftlyViolet : colors.gray500
                        }
                        borderWidth={2}
                        borderColor="white"
                      />
                    </YStack>
                  );
                })}
              </XStack>
            </YStack>
            {/* Affichage des primes sous les marqueurs */}
            <XStack position="relative" height={40}>
              {bonusTiers.map((tier, index) => {
                const percentage =
                  (tier.threshold /
                    bonusTiers[bonusTiers.length - 1].threshold) *
                  100;
                const isUnlocked = currentRevenue >= tier.threshold;
                return (
                  <YStack
                    key={index}
                    position="absolute"
                    left={`${percentage}%`}
                    alignItems="center"
                    transform={[{ translateX: -20 }]}
                    minWidth={40}
                  >
                    <Text
                      fontSize={12}
                      fontWeight="600"
                      color={isUnlocked ? colors.shiftlyViolet : colors.gray500}
                      textAlign="center"
                    >
                      +{tier.bonus}€
                    </Text>
                  </YStack>
                );
              })}
            </XStack>
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
}
