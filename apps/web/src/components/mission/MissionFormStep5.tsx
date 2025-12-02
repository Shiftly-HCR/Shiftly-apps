"use client";

import { YStack, Text, Image } from "tamagui";
import { Button, Input, ImagePicker, colors } from "@shiftly/ui";

interface MissionFormStep5Props {
  hourlyRate: string;
  setHourlyRate: (value: string) => void;
  imagePreview: string;
  title: string;
  city: string;
  startDate: string;
  endDate: string;
  onImageChange: (file: File | null) => void;
  onImageRemove?: () => void;
}

export function MissionFormStep5({
  hourlyRate,
  setHourlyRate,
  imagePreview,
  title,
  city,
  startDate,
  endDate,
  onImageChange,
  onImageRemove,
}: MissionFormStep5Props) {
  return (
    <YStack gap="$4">
      <Text fontSize={24} fontWeight="700" color={colors.gray900}>
        Mission à publier
      </Text>

      {/* Image de la mission */}
      {imagePreview ? (
        <YStack gap="$3">
          <Text fontSize={16} fontWeight="600" color={colors.gray900}>
            Photo de la mission
          </Text>
          <YStack
            height={250}
            borderRadius={12}
            overflow="hidden"
            borderWidth={1}
            borderColor={colors.gray200}
          >
            <Image
              source={{ uri: imagePreview }}
              width="100%"
              height={250}
              style={{
                width: "100%",
                height: 250,
                objectFit: "cover",
              }}
            />
          </YStack>
          {onImageRemove ? (
            <Button
              variant="outline"
              size="sm"
              onPress={onImageRemove}
            >
              Changer l'image
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onPress={() => onImageChange(null)}
            >
              Changer l'image
            </Button>
          )}
        </YStack>
      ) : (
        <ImagePicker
          value={null}
          onChange={onImageChange}
          shape="square"
          size={250}
          placeholder="Ajoutez une photo de votre établissement"
        />
      )}

      <Input
        label="Taux horaire (€)"
        placeholder="25"
        value={hourlyRate}
        onChangeText={setHourlyRate}
        keyboardType="decimal-pad"
      />

      {/* Résumé */}
      <YStack
        padding="$4"
        backgroundColor={colors.backgroundLight}
        borderRadius={12}
        gap="$2"
      >
        <Text fontSize={16} fontWeight="700" color={colors.gray900}>
          Résumé
        </Text>
        <Text fontSize={14} color={colors.gray700}>
          <Text fontWeight="600">Poste:</Text> {title || "Non défini"}
        </Text>
        <Text fontSize={14} color={colors.gray700}>
          <Text fontWeight="600">Ville:</Text> {city || "Non définie"}
        </Text>
        <Text fontSize={14} color={colors.gray700}>
          <Text fontWeight="600">Dates:</Text>{" "}
          {startDate && endDate
            ? `Du ${startDate} au ${endDate}`
            : "Non définies"}
        </Text>
        <Text fontSize={14} color={colors.gray700}>
          <Text fontWeight="600">Taux horaire:</Text>{" "}
          {hourlyRate ? `${hourlyRate}€/h` : "Non défini"}
        </Text>
      </YStack>
    </YStack>
  );
}

