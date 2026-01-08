"use client";

import { YStack, XStack, Text, Image } from "tamagui";
import { Button, Input, ImagePicker, colors } from "@shiftly/ui";

interface MissionFormStep5Props {
  hourlyRate: string;
  setHourlyRate: (value: string) => void;
  dailyRate: string;
  setDailyRate: (value: string) => void;
  totalSalary: string;
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
  dailyRate,
  setDailyRate,
  totalSalary,
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

      <YStack gap="$4">
        <Text fontSize={18} fontWeight="600" color={colors.gray900}>
          Rémunération
        </Text>
        
        <XStack gap="$3" flexWrap="wrap">
          <YStack flex={1} minWidth={200}>
            <Input
              label="Taux horaire (€)"
              placeholder="25"
              value={hourlyRate}
              onChangeText={setHourlyRate}
              keyboardType="decimal-pad"
            />
          </YStack>
          
          <YStack flex={1} minWidth={200}>
            <Input
              label="TJM - Taux Journalier Moyen (€)"
              placeholder="Calculé automatiquement"
              value={dailyRate}
              onChangeText={setDailyRate}
              keyboardType="decimal-pad"
              helperText="Calculé automatiquement si le tarif horaire est renseigné"
            />
          </YStack>
        </XStack>

        {totalSalary && (
          <YStack
            padding="$3"
            backgroundColor={colors.shiftlyVioletLight}
            borderRadius={8}
            borderWidth={1}
            borderColor={colors.shiftlyViolet}
          >
            <XStack gap="$1" flexWrap="wrap">
              <Text fontSize={14} fontWeight="600" color={colors.shiftlyViolet}>
                Salaire total de la mission:
              </Text>
              <Text fontSize={14} fontWeight="600" color={colors.shiftlyViolet}>
                {totalSalary ? parseFloat(totalSalary).toFixed(2) : "0.00"} €
              </Text>
            </XStack>
            <Text fontSize={12} color={colors.gray700} marginTop="$1">
              (TJM × nombre de jours)
            </Text>
          </YStack>
        )}
      </YStack>

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
        <XStack gap="$1">
          <Text fontSize={14} fontWeight="600" color={colors.gray700}>
            Poste:
          </Text>
          <Text fontSize={14} color={colors.gray700}>
            {title || "Non défini"}
          </Text>
        </XStack>
        <XStack gap="$1">
          <Text fontSize={14} fontWeight="600" color={colors.gray700}>
            Ville:
          </Text>
          <Text fontSize={14} color={colors.gray700}>
            {city || "Non définie"}
          </Text>
        </XStack>
        <XStack gap="$1">
          <Text fontSize={14} fontWeight="600" color={colors.gray700}>
            Dates:
          </Text>
          <Text fontSize={14} color={colors.gray700}>
            {startDate && endDate
              ? `Du ${startDate} au ${endDate}`
              : "Non définies"}
          </Text>
        </XStack>
        <XStack gap="$1">
          <Text fontSize={14} fontWeight="600" color={colors.gray700}>
            Taux horaire:
          </Text>
          <Text fontSize={14} color={colors.gray700}>
            {hourlyRate ? `${hourlyRate}€/h` : "Non défini"}
          </Text>
        </XStack>
        {dailyRate && (
          <XStack gap="$1">
            <Text fontSize={14} fontWeight="600" color={colors.gray700}>
              TJM:
            </Text>
            <Text fontSize={14} color={colors.gray700}>
              {dailyRate}€/jour
            </Text>
          </XStack>
        )}
        {totalSalary && (
          <XStack gap="$1">
            <Text fontSize={14} fontWeight="600" color={colors.gray700}>
              Salaire total:
            </Text>
            <Text fontSize={14} color={colors.gray700}>
              {totalSalary ? parseFloat(totalSalary).toFixed(2) : "0.00"}€
            </Text>
          </XStack>
        )}
      </YStack>
    </YStack>
  );
}

