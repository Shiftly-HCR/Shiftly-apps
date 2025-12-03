"use client";

import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";

interface BonusTier {
  threshold: number;
  bonus: number;
  label: string;
}

interface ProgressionScaleProps {
  currentRevenue: number;
  bonusTiers: BonusTier[];
}

/**
 * Composant pour afficher l'échelle de progression avec les primes
 */
export function ProgressionScale({
  currentRevenue,
  bonusTiers,
}: ProgressionScaleProps) {
  // Trouver le niveau actuel et le prochain
  const currentTier = bonusTiers.findIndex(
    (tier) => currentRevenue < tier.threshold
  );
  const activeTierIndex =
    currentTier === -1 ? bonusTiers.length - 1 : currentTier - 1;
  const nextTier = currentTier === -1 ? null : bonusTiers[currentTier];

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

  return (
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
            {/* Marqueurs des niveaux */}
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
  );
}

