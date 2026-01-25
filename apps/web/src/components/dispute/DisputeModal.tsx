"use client";

import { useState } from "react";
import { YStack, XStack, Text, TextArea } from "tamagui";
import { colors, Button } from "@shiftly/ui";
import { AlertTriangle, X } from "lucide-react";

export type DisputeReason =
  | "work_not_done"
  | "poor_quality"
  | "late_delivery"
  | "other";

interface DisputeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: DisputeReason, description: string) => Promise<void>;
  missionTitle?: string;
}

const DISPUTE_REASONS: Array<{
  value: DisputeReason;
  label: string;
  description: string;
}> = [
  {
    value: "work_not_done",
    label: "Travail non effectué",
    description: "Le freelance n'a pas effectué le travail demandé",
  },
  {
    value: "poor_quality",
    label: "Qualité insuffisante",
    description: "Le travail effectué ne correspond pas aux attentes",
  },
  {
    value: "late_delivery",
    label: "Livraison en retard",
    description: "Le travail n'a pas été livré dans les délais",
  },
  {
    value: "other",
    label: "Autre",
    description: "Autre problème non listé",
  },
];

/**
 * Mappe une raison enum vers un label lisible
 */
function getReasonLabel(reason: DisputeReason): string {
  return DISPUTE_REASONS.find((r) => r.value === reason)?.label || reason;
}

export function DisputeModal({
  open,
  onOpenChange,
  onConfirm,
  missionTitle,
}: DisputeModalProps) {
  const [selectedReason, setSelectedReason] = useState<DisputeReason | null>(
    null
  );
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleCancel = () => {
    setSelectedReason(null);
    setDescription("");
    setError(null);
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (!selectedReason) {
      setError("Veuillez sélectionner une raison");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Envoyer le label lisible au lieu de la valeur enum
      const reasonLabel = getReasonLabel(selectedReason);
      await onConfirm(reasonLabel, description);
      // Réinitialiser le formulaire
      setSelectedReason(null);
      setDescription("");
      onOpenChange(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors du signalement";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <YStack
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor="rgba(0, 0, 0, 0.5)"
        zIndex={99998}
        onPress={handleCancel}
      />

      {/* Dialog */}
      <YStack
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="90%"
        maxWidth={500}
        maxHeight="90vh"
        backgroundColor={colors.white}
        borderRadius="$4"
        padding="$6"
        gap="$4"
        zIndex={99999}
        shadowColor="#000000"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.25}
        shadowRadius={12}
        elevation={10}
      >
        {/* Header */}
        <XStack alignItems="center" justifyContent="space-between">
          <XStack alignItems="center" gap="$3" flex={1}>
            <YStack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="#F59E0B15"
              alignItems="center"
              justifyContent="center"
            >
              <AlertTriangle size={20} color="#F59E0B" />
            </YStack>
            <YStack flex={1}>
              <Text fontSize={18} fontWeight="700" color={colors.gray900}>
                Signaler un problème
              </Text>
              {missionTitle && (
                <Text fontSize={13} color={colors.gray600} marginTop="$1">
                  Mission: {missionTitle}
                </Text>
              )}
            </YStack>
          </XStack>
          <Button variant="ghost" size="sm" onPress={handleCancel}>
            <X size={20} color={colors.gray600} />
          </Button>
        </XStack>

        {/* Message */}
        <Text fontSize={14} color={colors.gray700} lineHeight={20}>
          En signalant un problème, la libération automatique des fonds sera
          bloquée jusqu'à résolution par notre équipe.
        </Text>

        {/* Raisons */}
        <YStack gap="$2">
          <Text fontSize={14} fontWeight="600" color={colors.gray900}>
            Raison du problème *
          </Text>
          {DISPUTE_REASONS.map((reason) => (
            <YStack
              key={reason.value}
              padding="$3"
              borderRadius="$3"
              borderWidth={2}
              borderColor={
                selectedReason === reason.value
                  ? colors.shiftlyViolet
                  : colors.gray200
              }
              backgroundColor={
                selectedReason === reason.value
                  ? `${colors.shiftlyViolet}10`
                  : colors.white
              }
              cursor="pointer"
              hoverStyle={{
                borderColor: colors.shiftlyViolet,
                backgroundColor: `${colors.shiftlyViolet}05`,
              }}
              onPress={() => setSelectedReason(reason.value)}
            >
              <Text fontSize={14} fontWeight="600" color={colors.gray900}>
                {reason.label}
              </Text>
              <Text fontSize={12} color={colors.gray600} marginTop="$1">
                {reason.description}
              </Text>
            </YStack>
          ))}
        </YStack>

        {/* Description */}
        <YStack gap="$2">
          <Text fontSize={14} fontWeight="600" color={colors.gray900}>
            Description (optionnel)
          </Text>
          <TextArea
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez le problème en détail..."
            minHeight={100}
            maxHeight={200}
            fontSize={14}
            borderColor={colors.gray200}
            borderRadius="$3"
            padding="$3"
          />
        </YStack>

        {/* Erreur */}
        {error && (
          <YStack
            backgroundColor="#FEF2F2"
            borderRadius="$2"
            padding="$2"
          >
            <Text fontSize={13} color="#DC2626">
              {error}
            </Text>
          </YStack>
        )}

        {/* Actions */}
        <XStack gap="$3" justifyContent="flex-end" marginTop="$2">
          <Button
            variant="outline"
            onPress={handleCancel}
            disabled={isSubmitting}
            style={{ minWidth: 100 }}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onPress={handleConfirm}
            disabled={!selectedReason || isSubmitting}
            style={{ minWidth: 120 }}
          >
            {isSubmitting ? "Envoi..." : "Signaler le problème"}
          </Button>
        </XStack>
      </YStack>
    </>
  );
}
