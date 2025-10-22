import { YStack, XStack, Text, Image } from "tamagui";
import React from "react";
import { BaseCard } from "./BaseCard";
import { Button } from "../Button";

interface MissionCardProps {
  title: string;
  date?: string;
  time?: string;
  price: string;
  priceUnit?: string;
  image?: string;
  isPremium?: boolean;
  onPress?: () => void;
  showButton?: boolean;
  buttonText?: string;
}

export const MissionCard = ({
  title,
  date,
  time,
  price,
  priceUnit = "/ heure",
  image,
  isPremium = false,
  onPress,
  showButton = true,
  buttonText = "Voir la mission",
}: MissionCardProps) => {
  return (
    <BaseCard
      elevated
      clickable
      onPress={onPress}
      padding={0}
      overflow="hidden"
      position="relative"
    >
      {/* Image */}
      {image && (
        <Image
          source={{ uri: image }}
          height={180}
          width="100%"
          resizeMode="cover"
        />
      )}

      <YStack padding="$4" gap="$3">
        {/* Header avec badge Premium */}
        <XStack alignItems="flex-start" justifyContent="space-between">
          <YStack flex={1} gap="$2">
            <Text
              fontSize={16}
              fontWeight="600"
              color="$color"
              numberOfLines={2}
            >
              {title}
            </Text>
          </YStack>

          {isPremium && (
            <XStack
              paddingHorizontal={12}
              paddingVertical={6}
              borderRadius="$2"
              backgroundColor="#FFF4E6"
              marginLeft="$2"
            >
              <Text fontSize={12} fontWeight="600" color="#F59E0B">
                Premium
              </Text>
            </XStack>
          )}
        </XStack>

        {/* Date et horaires */}
        <YStack gap="$2">
          {date && (
            <XStack alignItems="center" gap="$2">
              <Text fontSize={14} color="#999999">
                📅
              </Text>
              <Text fontSize={14} color="#666666">
                {date}
              </Text>
            </XStack>
          )}

          {time && (
            <XStack alignItems="center" gap="$2">
              <Text fontSize={14} color="#999999">
                🕐
              </Text>
              <Text fontSize={14} color="#666666">
                {time}
              </Text>
            </XStack>
          )}
        </YStack>

        {/* Prix */}
        <XStack alignItems="baseline" gap="$1">
          <Text fontSize={18} fontWeight="700" color="$primary">
            {price}
          </Text>
          <Text fontSize={14} fontWeight="500" color="#666666">
            {priceUnit}
          </Text>
        </XStack>

        {/* Bouton */}
        {showButton && (
          <Button variant="primary" size="md" onPress={onPress}>
            {buttonText}
          </Button>
        )}
      </YStack>
    </BaseCard>
  );
};
