"use client";

import { YStack, XStack, Text, Image } from "tamagui";
import type { Mission } from "@shiftly/data";

interface Props {
  mission: Mission;
  onClick: () => void;
}

export function MissionBubbleMarker({ mission, onClick }: Props) {
  return (
    <YStack
      onPress={onClick}
      cursor="pointer"
      alignItems="center"
      position="relative"
    >
      {/* Corps de la bulle */}
      <YStack
        // petite ombre + bord arrondi
        backgroundColor="$background"
        borderRadius="$4"
        padding="$2"
        elevation="$2"
        maxWidth={220}
        position="relative"
        zIndex={1}
      >
        {/* Contenu principal */}
        <XStack gap="$2" alignItems="center">
          {mission.image_url && (
            <Image
              source={{ uri: mission.image_url }}
              width={40}
              height={40}
              borderRadius={12}
            />
          )}
          <YStack>
            <Text fontWeight="600" numberOfLines={1}>
              {mission.title}
            </Text>
            {mission.hourly_rate && (
              <Text fontSize="$2">{mission.hourly_rate}€ / heure</Text>
            )}
          </YStack>
        </XStack>
      </YStack>

      {/* Pointe triangulaire en bas pour indiquer l'emplacement précis */}
      <YStack alignItems="center" marginTop={-2} position="relative" zIndex={0}>
        {/* Pointe triangulaire pointant vers le bas */}
        <YStack
          width={0}
          height={0}
          borderLeftWidth={8}
          borderRightWidth={8}
          borderTopWidth={10}
          borderLeftColor="transparent"
          borderRightColor="transparent"
          borderTopColor="$background"
        />
      </YStack>
    </YStack>
  );
}
