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
  onEdit?: () => void; // Callback pour le bouton "Modifier" (mode recruteur)
  onManageCandidates?: () => void; // Callback pour le bouton "Gérer les candidatures" (mode recruteur)
  missionId?: string; // ID de la mission pour le lien vers le dashboard
  fullHeight?: boolean;
}

function getMissionEmoji(title: string): string {
  const normalizedTitle = title.toLowerCase();

  if (
    normalizedTitle.includes("barman") ||
    normalizedTitle.includes("barmaid") ||
    normalizedTitle.includes("serveur") ||
    normalizedTitle.includes("serveuse")
  ) {
    return "🍸";
  }

  if (
    normalizedTitle.includes("cuisinier") ||
    normalizedTitle.includes("chef") ||
    normalizedTitle.includes("cuisine")
  ) {
    return "👨‍🍳";
  }

  if (
    normalizedTitle.includes("vendeur") ||
    normalizedTitle.includes("vendeuse") ||
    normalizedTitle.includes("caissier") ||
    normalizedTitle.includes("caissière")
  ) {
    return "🛍️";
  }

  return "🍽️";
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
  onEdit,
  onManageCandidates,
  missionId,
  fullHeight = false,
}: MissionCardProps) => {
  const missionEmoji = getMissionEmoji(title);

  return (
    <BaseCard
      elevated
      clickable
      onPress={onPress}
      padding={0}
      overflow="hidden"
      position="relative"
      height={fullHeight ? "100%" : undefined}
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
      {!image && (
        <YStack
          height={180}
          width="100%"
          alignItems="center"
          justifyContent="center"
          gap="$2"
          style={{
            background:
              "linear-gradient(135deg, rgba(122, 36, 122, 0.08) 0%, rgba(122, 36, 122, 0.18) 100%)",
          }}
        >
          <Text fontSize={34}>{missionEmoji}</Text>
          <Text fontSize={13} color="#6B7280" fontWeight="600">
            Photo non disponible
          </Text>
        </YStack>
      )}

      <YStack padding="$4" gap="$3" flex={fullHeight ? 1 : undefined}>
        <YStack
          gap="$3"
          flex={fullHeight ? 1 : undefined}
          justifyContent={!image && fullHeight ? "center" : "flex-start"}
        >
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
        </YStack>

        {/* Boutons */}
        {onEdit || onManageCandidates ? (
          // Mode recruteur : afficher boutons "Modifier" et/ou "Gérer les candidatures"
          <YStack gap="$2" width="100%">
            {onManageCandidates && (
              <Button
                variant="primary"
                size="md"
                width="100%"
                onPress={(e: any) => {
                  e?.stopPropagation();
                  onManageCandidates();
                }}
              >
                Gérer les candidatures
              </Button>
            )}
            {onEdit && (
              <XStack gap="$2" width="100%">
                <YStack flex={1}>
                  <Button
                    variant="outline"
                    size="md"
                    width="100%"
                    onPress={(e: any) => {
                      e?.stopPropagation();
                      onPress?.();
                    }}
                  >
                    Voir
                  </Button>
                </YStack>
                <YStack flex={1}>
                  <Button
                    variant="outline"
                    size="md"
                    width="100%"
                    onPress={(e: any) => {
                      e?.stopPropagation();
                      onEdit();
                    }}
                  >
                    Modifier
                  </Button>
                </YStack>
              </XStack>
            )}
          </YStack>
        ) : showButton ? (
          // Mode public : afficher bouton "Voir la mission"
          <Button variant="primary" size="md" width="100%" onPress={onPress}>
            {buttonText}
          </Button>
        ) : null}
      </YStack>
    </BaseCard>
  );
};
