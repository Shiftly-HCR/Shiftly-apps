"use client";

import { YStack, Text } from "tamagui";

interface Props {
  count: number;
  onClick: () => void;
}

export function MissionClusterMarker({ count, onClick }: Props) {
  return (
    <YStack
      onPress={onClick}
      cursor="pointer"
      backgroundColor="$violet10"
      borderRadius={20}
      paddingHorizontal="$3"
      paddingVertical="$2"
      elevation="$3"
      minWidth={40}
      alignItems="center"
      justifyContent="center"
      borderWidth={2}
      borderColor="$background"
    >
      <Text fontWeight="700" fontSize="$4" color="$background">
        +{count}
      </Text>
    </YStack>
  );
}

