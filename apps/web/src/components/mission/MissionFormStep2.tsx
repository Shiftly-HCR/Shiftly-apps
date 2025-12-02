"use client";

import { YStack, XStack, Text } from "tamagui";
import { Select, colors } from "@shiftly/ui";
import { Building2 } from "lucide-react";
import type { Establishment } from "@shiftly/data";

interface MissionFormStep2Props {
  selectedEstablishmentId: string | null;
  setSelectedEstablishmentId: (value: string | null) => void;
  establishments: Establishment[];
}

export function MissionFormStep2({
  selectedEstablishmentId,
  setSelectedEstablishmentId,
  establishments,
}: MissionFormStep2Props) {
  const selectedEstablishment = establishments.find(
    (est) => est.id === selectedEstablishmentId
  );

  return (
    <YStack gap="$4">
      <Text fontSize={24} fontWeight="700" color={colors.gray900}>
        Établissement
      </Text>
      <Text fontSize={14} color={colors.gray500}>
        Liez cette mission à un établissement existant ou créez-la sans
        établissement
      </Text>

      <Select
        label="Établissement (optionnel)"
        value={selectedEstablishmentId || ""}
        onValueChange={(value) => setSelectedEstablishmentId(value || null)}
        placeholder="Aucun établissement"
        options={[
          { label: "Aucun établissement", value: "" },
          ...establishments.map((est) => ({
            label: `${est.name}${est.city ? ` - ${est.city}` : ""}`,
            value: est.id,
          })),
        ]}
      />

      {selectedEstablishmentId && selectedEstablishment && (
        <YStack
          padding="$4"
          backgroundColor={colors.backgroundLight}
          borderRadius="$3"
          gap="$3"
          borderWidth={1}
          borderColor={colors.shiftlyVioletLight}
        >
          <XStack alignItems="center" gap="$2">
            <Building2 size={18} color={colors.shiftlyViolet} />
            <Text fontSize={16} fontWeight="600" color={colors.gray900}>
              {selectedEstablishment.name}
            </Text>
          </XStack>

          {selectedEstablishment.address && (
            <YStack gap="$1">
              <Text fontSize={12} fontWeight="600" color={colors.gray500}>
                Adresse de l'établissement (sera utilisée pour la mission) :
              </Text>
              <Text fontSize={14} color={colors.gray700}>
                {selectedEstablishment.address}
              </Text>
              {(selectedEstablishment.postal_code ||
                selectedEstablishment.city) && (
                <Text fontSize={14} color={colors.gray500}>
                  {[
                    selectedEstablishment.postal_code,
                    selectedEstablishment.city,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </Text>
              )}
            </YStack>
          )}

          <YStack
            padding="$2"
            backgroundColor={colors.white}
            borderRadius="$2"
            gap="$1"
          >
            <Text fontSize={12} color={colors.shiftlyViolet} fontWeight="600">
              ✓ L'adresse sera automatiquement héritée à l'étape suivante
            </Text>
          </YStack>
        </YStack>
      )}
    </YStack>
  );
}

