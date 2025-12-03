"use client";

import { YStack, XStack, Text } from "tamagui";
import { MapPin, Building2, Star } from "lucide-react";
import { colors } from "@shiftly/ui";
import type { Mission, Establishment } from "@shiftly/data";

interface MissionAddressDisplayProps {
  establishment?: Establishment | null;
  mission: Mission;
  displayAddress?: string;
  displayCity?: string;
  displayName?: string;
}

/**
 * Composant pour afficher l'adresse d'une mission ou d'un établissement
 * Affiche le header avec icône et nom si c'est un établissement
 */
export function MissionAddressDisplay({
  establishment,
  mission,
  displayAddress,
  displayCity,
  displayName,
}: MissionAddressDisplayProps) {
  const hasEstablishment = !!establishment;

  // Déterminer les valeurs à afficher
  const address =
    displayAddress && displayAddress !== "Adresse non renseignée"
      ? displayAddress
      : establishment?.address || mission.address;
  const city =
    displayCity && displayCity !== "Ville non renseignée"
      ? displayCity
      : establishment?.city || mission.city;
  const postalCode =
    establishment?.postal_code || mission.postal_code;
  const name = displayName || establishment?.name;

  // Vérifier si on a des informations à afficher
  const hasAddress = !!(address || city || postalCode);

  if (!hasAddress && !hasEstablishment) {
    return (
      <YStack gap="$3" marginBottom="$4">
        <Text fontSize={14} color="#999" fontStyle="italic">
          Adresse non renseignée
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$3" marginBottom="$4">
      {/* Header avec icône et nom si établissement */}
      {hasEstablishment && name && (
        <XStack alignItems="center" gap="$3" marginBottom="$4">
          <YStack
            width={60}
            height={60}
            borderRadius={30}
            backgroundColor="#F0F0F0"
            alignItems="center"
            justifyContent="center"
          >
            <Building2 size={28} color={colors.shiftlyViolet} />
          </YStack>
          <YStack flex={1}>
            <Text fontSize={16} fontWeight="600" color="#000">
              {name}
            </Text>
            <XStack alignItems="center" gap="$1" marginTop="$1">
              <Star
                size={14}
                color={colors.shiftlyViolet}
                fill={colors.shiftlyViolet}
              />
              <Text fontSize={14} color={colors.shiftlyViolet} fontWeight="600">
                4.5
              </Text>
              <Text fontSize={12} color="#999">
                (0 avis)
              </Text>
            </XStack>
          </YStack>
        </XStack>
      )}

      {/* Adresse */}
      {hasAddress && (
        <XStack alignItems="center" gap="$2">
          <MapPin size={16} color="#666" style={{ flexShrink: 0 }} />
          <Text fontSize={14} color="#666" flex={1}>
            {[
              address,
              [postalCode, city].filter(Boolean).join(" "),
            ]
              .filter(Boolean)
              .join(", ")}
          </Text>
        </XStack>
      )}

      {/* Message si pas d'adresse mais qu'il y a un établissement */}
      {!hasAddress && hasEstablishment && (
        <Text fontSize={14} color="#999" fontStyle="italic">
          Adresse non renseignée
        </Text>
      )}
    </YStack>
  );
}

