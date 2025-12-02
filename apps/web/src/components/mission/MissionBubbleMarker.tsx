"use client";

import { YStack, XStack, Text, Card, Image } from "tamagui";
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
      // petite ombre + bord arrondi
      bg="$background"
      br="$4"
      padding="$2"
      elevation="$2"
      maxWidth={220}
    >
      {/* Contenu principal */}
      <XStack gap="$2" ai="center">
        {mission.image_url && (
          <Image
            source={{ uri: mission.image_url }}
            width={40}
            height={40}
            br="$3"
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

      {/* “tail” de la bulle */}
      <YStack ai="center" mt="$1">
        <YStack
          width={0}
          height={0}
          borderLeftWidth={6}
          borderRightWidth={6}
          borderTopWidth={8}
          borderLeftColor="transparent"
          borderRightColor="transparent"
          borderTopColor="$background"
        />
      </YStack>
    </YStack>
  );
}
