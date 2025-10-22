import { YStack, XStack, Text, Image, ScrollView } from "tamagui";
import React from "react";
import { BaseCard } from "./BaseCard";
import { Button } from "../Button";
import { Badge } from "../Badge";

interface MissionDetailCardProps {
  title: string;
  location: string;
  establishment?: string;
  rating?: number;
  reviewCount?: number;
  price: string;
  priceUnit?: string;
  totalEstimate?: string;
  description?: string;
  hours?: string;
  dates?: string;
  image?: string;
  skills?: string[];
  equipment?: string[];
  mapImage?: string;
  onApply?: () => void;
  onContact?: () => void;
}

export const MissionDetailCard = ({
  title,
  location,
  establishment,
  rating,
  reviewCount,
  price,
  priceUnit = "€/h",
  totalEstimate,
  description,
  hours,
  dates,
  image,
  skills,
  equipment,
  mapImage,
  onApply,
  onContact,
}: MissionDetailCardProps) => {
  return (
    <ScrollView>
      <YStack gap="$4" padding="$4">
        {/* Header avec image */}
        {image && (
          <Image
            source={{ uri: image }}
            height={200}
            width="100%"
            borderRadius="$4"
            resizeMode="cover"
          />
        )}

        {/* Titre et établissement */}
        <YStack gap="$2">
          <Text fontSize={24} fontWeight="700" color="$color">
            {title}
          </Text>

          {establishment && (
            <XStack alignItems="center" gap="$2">
              <Text fontSize={14} color="#999999">
                {establishment}
              </Text>
              {rating && (
                <>
                  <Text color="#999999">•</Text>
                  <XStack alignItems="center" gap="$1">
                    <Text fontSize={14} color="$gold">
                      ⭐
                    </Text>
                    <Text fontSize={14} fontWeight="600" color="$color">
                      {rating.toFixed(1)}
                    </Text>
                    {reviewCount && (
                      <Text fontSize={14} color="#999999">
                        ({reviewCount})
                      </Text>
                    )}
                  </XStack>
                </>
              )}
            </XStack>
          )}
        </YStack>

        {/* Rémunération */}
        <BaseCard backgroundColor="$primaryLight" borderColor="$primary">
          <YStack gap="$2">
            <Text fontSize={14} color="#999999">
              Rémunération
            </Text>
            <XStack alignItems="baseline" gap="$2">
              <Text fontSize={28} fontWeight="700" color="$primary">
                {price}
              </Text>
              <Text fontSize={16} color="$primary">
                {priceUnit}
              </Text>
            </XStack>
            {totalEstimate && (
              <Text fontSize={14} color="#999999">
                Total estimé: {totalEstimate}
              </Text>
            )}
          </YStack>
        </BaseCard>

        {/* Description */}
        {description && (
          <YStack gap="$2">
            <Text fontSize={16} fontWeight="600" color="$color">
              Description de la mission
            </Text>
            <Text fontSize={14} color="#666666" lineHeight={22}>
              {description}
            </Text>
          </YStack>
        )}

        {/* Horaires et dates */}
        {(hours || dates) && (
          <YStack gap="$2">
            <Text fontSize={16} fontWeight="600" color="$color">
              Horaires et dates
            </Text>
            {hours && (
              <XStack gap="$2">
                <Text fontSize={14} color="#999999">
                  🕐
                </Text>
                <Text fontSize={14} color="#666666">
                  {hours}
                </Text>
              </XStack>
            )}
            {dates && (
              <XStack gap="$2">
                <Text fontSize={14} color="#999999">
                  📅
                </Text>
                <Text fontSize={14} color="#666666">
                  {dates}
                </Text>
              </XStack>
            )}
          </YStack>
        )}

        {/* Compétences requises */}
        {skills && skills.length > 0 && (
          <YStack gap="$2">
            <Text fontSize={16} fontWeight="600" color="$color">
              Compétences requises
            </Text>
            <XStack gap="$2" flexWrap="wrap">
              {skills.map((skill, index) => (
                <Badge key={index} variant="outline">
                  {skill}
                </Badge>
              ))}
            </XStack>
          </YStack>
        )}

        {/* Équipements */}
        {equipment && equipment.length > 0 && (
          <YStack gap="$2">
            <Text fontSize={16} fontWeight="600" color="$color">
              Équipements / Tenue demandée
            </Text>
            <YStack gap="$1">
              {equipment.map((item, index) => (
                <XStack key={index} gap="$2" alignItems="center">
                  <Text fontSize={14} color="$primary">
                    ✓
                  </Text>
                  <Text fontSize={14} color="#666666">
                    {item}
                  </Text>
                </XStack>
              ))}
            </YStack>
          </YStack>
        )}

        {/* Localisation */}
        <YStack gap="$2">
          <Text fontSize={16} fontWeight="600" color="$color">
            Localisation
          </Text>
          <Text fontSize={14} color="#666666">
            📍 {location}
          </Text>
          {mapImage && (
            <Image
              source={{ uri: mapImage }}
              height={200}
              width="100%"
              borderRadius="$4"
              resizeMode="cover"
            />
          )}
        </YStack>

        {/* Actions */}
        <YStack gap="$3" marginTop="$2">
          {onApply && (
            <Button variant="primary" size="lg" onPress={onApply}>
              Postuler à cette mission
            </Button>
          )}
          {onContact && (
            <Button variant="secondary" size="lg" onPress={onContact}>
              Contacter le recruteur
            </Button>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  );
};
