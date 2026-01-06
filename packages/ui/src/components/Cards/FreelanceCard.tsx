import { YStack, XStack, Text, Avatar as TAAvatar } from "tamagui";
import React from "react";
import { BaseCard } from "./BaseCard";
import { Button } from "../Button";

interface FreelanceCardProps {
  name: string;
  subtitle?: string;
  avatar?: string;
  rating?: number;
  isOnline?: boolean;
  tags?: string[];
  dailyRate?: number; // TJM (Taux Journalier Moyen) en euros
  onPress?: () => void;
  onViewProfile?: () => void;
}

export const FreelanceCard = ({
  name,
  subtitle,
  avatar,
  rating,
  isOnline = false,
  tags = [],
  dailyRate,
  onPress,
  onViewProfile,
}: FreelanceCardProps) => {
  return (
    <BaseCard
      clickable
      onPress={onPress}
      alignItems="center"
      gap="$3"
      minWidth={200}
      maxWidth={280}
      padding="$4"
    >
      {/* Avatar avec indicateur de statut */}
      <YStack position="relative">
        <TAAvatar circular size="$8">
          <TAAvatar.Image src={avatar} />
          <TAAvatar.Fallback backgroundColor="$primary" />
        </TAAvatar>

        {isOnline && (
          <YStack
            position="absolute"
            bottom={4}
            right={4}
            width={16}
            height={16}
            backgroundColor="#4CAF50"
            borderRadius={8}
            borderWidth={2}
            borderColor="white"
          />
        )}
      </YStack>

      {/* Nom et sous-titre */}
      <YStack alignItems="center" gap="$1">
        <Text fontSize={16} fontWeight="600" color="$color" textAlign="center">
          {name}
        </Text>

        {subtitle && (
          <Text fontSize={13} color="#999999" textAlign="center">
            {subtitle}
          </Text>
        )}

        {rating && (
          <XStack alignItems="center" gap="$1" marginTop="$1">
            <Text fontSize={14} color="$gold">
              ⭐
            </Text>
            <Text fontSize={13} fontWeight="600" color="#666666">
              {rating.toFixed(1)}
            </Text>
          </XStack>
        )}

        {dailyRate && (
          <XStack alignItems="center" gap="$1" marginTop="$1">
            <Text fontSize={14} fontWeight="700" color="$primary">
              {dailyRate.toFixed(2)} €
            </Text>
            <Text fontSize={12} color="#999999">
              / jour
            </Text>
          </XStack>
        )}
      </YStack>

      {/* Tags/Compétences */}
      {tags.length > 0 && (
        <XStack gap="$2" flexWrap="wrap" justifyContent="center">
          {tags.map((tag, index) => (
            <XStack
              key={index}
              paddingHorizontal={12}
              paddingVertical={6}
              borderRadius="$2"
              backgroundColor="$surface"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <Text fontSize={12} color="#666666">
                {tag}
              </Text>
            </XStack>
          ))}
        </XStack>
      )}

      {/* Bouton Voir le profil */}
      {onViewProfile && (
        <Button
          variant="secondary"
          size="sm"
          onPress={onViewProfile}
          width="100%"
        >
          Voir le profil
        </Button>
      )}
    </BaseCard>
  );
};
