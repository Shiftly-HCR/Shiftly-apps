"use client";

import { YStack, XStack, Text } from "tamagui";
import { DatePicker, TimePicker, colors } from "@shiftly/ui";

interface MissionFormStep4Props {
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  startTime: string;
  setStartTime: (value: string) => void;
  endTime: string;
  setEndTime: (value: string) => void;
}

export function MissionFormStep4({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
}: MissionFormStep4Props) {
  return (
    <YStack gap="$4">
      <Text fontSize={24} fontWeight="700" color={colors.gray900}>
        Éléments de planning
      </Text>

      <Text fontSize={16} fontWeight="600" color={colors.gray900}>
        Périodes de dates
      </Text>

      <XStack gap="$3">
        <YStack flex={1}>
          <DatePicker
            label="Date de début"
            value={startDate}
            onChangeText={setStartDate}
          />
        </YStack>
        <YStack flex={1}>
          <DatePicker
            label="Date de fin"
            value={endDate}
            onChangeText={setEndDate}
            min={startDate || undefined}
          />
        </YStack>
      </XStack>

      <Text
        fontSize={16}
        fontWeight="600"
        color={colors.gray900}
        marginTop="$2"
      >
        Fourchette d'horaires
      </Text>

      <XStack gap="$3">
        <YStack flex={1}>
          <TimePicker
            label="Heure de début"
            value={startTime}
            onChangeText={setStartTime}
          />
        </YStack>
        <YStack flex={1}>
          <TimePicker
            label="Heure de fin"
            value={endTime}
            onChangeText={setEndTime}
          />
        </YStack>
      </XStack>
    </YStack>
  );
}

