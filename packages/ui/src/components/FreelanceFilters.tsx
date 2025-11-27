import React, { useState } from "react";
import { YStack, XStack, Text } from "tamagui";
import { Select } from "./form/Select";
import { RadioGroup } from "./form/RadioGroup";
import { colors } from "../theme";

export interface FreelanceFiltersState {
  position?: string;
  location?: string;
  availability?: string;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  rating?: number;
  badge?: string;
}

interface FreelanceFiltersProps {
  filters: FreelanceFiltersState;
  onFiltersChange: (filters: FreelanceFiltersState) => void;
}

// Options pour les selects
const positionOptions = [
  { label: "Tous les postes", value: "all" },
  { label: "Serveur", value: "serveur" },
  { label: "Barman", value: "barman" },
  { label: "Chef de cuisine", value: "chef" },
  { label: "Commis de cuisine", value: "commis" },
  { label: "Réceptionniste", value: "receptionniste" },
  { label: "Manager", value: "manager" },
];

const locationOptions = [
  { label: "Partout", value: "all" },
  { label: "Paris", value: "paris" },
  { label: "Lyon", value: "lyon" },
  { label: "Marseille", value: "marseille" },
  { label: "Toulouse", value: "toulouse" },
  { label: "Nice", value: "nice" },
  { label: "Bordeaux", value: "bordeaux" },
];

const availabilityOptions = [
  { label: "Immédiatement", value: "immediate" },
  { label: "Cette semaine", value: "this_week" },
  { label: "Ce mois", value: "this_month" },
  { label: "Flexible", value: "flexible" },
];

const badgeOptions = [
  { label: "Certifié", value: "certified" },
  { label: "Shiftly+", value: "shiftly_plus" },
];

export function FreelanceFilters({
  filters,
  onFiltersChange,
}: FreelanceFiltersProps) {
  const [hourlyRate, setHourlyRate] = useState<[number, number]>([
    filters.hourlyRateMin || 15,
    filters.hourlyRateMax || 100,
  ]);

  const handleFilterChange = (key: keyof FreelanceFiltersState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleHourlyRateChange = (index: 0 | 1, value: number) => {
    const newRate: [number, number] = [...hourlyRate];
    newRate[index] = value;
    setHourlyRate(newRate);

    // S'assurer que min <= max
    if (index === 0 && value > hourlyRate[1]) {
      newRate[1] = value;
    } else if (index === 1 && value < hourlyRate[0]) {
      newRate[0] = value;
    }

    onFiltersChange({
      ...filters,
      hourlyRateMin: newRate[0],
      hourlyRateMax: newRate[1],
    });
  };

  const handleRatingClick = (rating: number) => {
    const newRating = filters.rating === rating ? undefined : rating;
    handleFilterChange("rating", newRating);
  };

  return (
    <YStack
      backgroundColor={colors.white}
      borderRadius={12}
      padding="$4"
      gap="$5"
      borderWidth={1}
      borderColor={colors.gray200}
      width="100%"
      maxWidth={350}
    >
      <Text
        fontSize={24}
        fontWeight="700"
        color={colors.gray900}
        marginBottom="$2"
      >
        Filtres
      </Text>

      {/* Poste */}
      <Select
        label="Poste"
        placeholder="Tous les postes"
        options={positionOptions}
        value={filters.position || "all"}
        onValueChange={(value) =>
          handleFilterChange("position", value === "all" ? undefined : value)
        }
      />

      {/* Localisation */}
      <Select
        label="Localisation"
        placeholder="Partout"
        options={locationOptions}
        value={filters.location || "all"}
        onValueChange={(value) =>
          handleFilterChange("location", value === "all" ? undefined : value)
        }
      />

      {/* Disponibilité */}
      <Select
        label="Disponibilité"
        placeholder="Immédiatement"
        options={availabilityOptions}
        value={filters.availability || "immediate"}
        onValueChange={(value) => handleFilterChange("availability", value)}
      />

      {/* Taux horaire */}
      <YStack gap="$2">
        <Text fontSize={14} fontWeight="600" color={colors.gray900}>
          Taux horaire
        </Text>
        <YStack gap="$3">
          <XStack
            gap="$2"
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal="$2"
          >
            <Text fontSize={14} color={colors.gray700} fontWeight="500">
              {hourlyRate[0]}€
            </Text>
            <Text fontSize={14} color={colors.gray700} fontWeight="500">
              {hourlyRate[1]}€
            </Text>
          </XStack>
          <YStack
            position="relative"
            height={40}
            justifyContent="center"
            paddingHorizontal="$1"
          >
            {/* Slider track */}
            <YStack
              height={6}
              backgroundColor={colors.gray200}
              borderRadius={3}
              position="relative"
              width="100%"
            >
              {/* Active range */}
              <YStack
                position="absolute"
                left={`${((hourlyRate[0] - 15) / 85) * 100}%`}
                width={`${((hourlyRate[1] - hourlyRate[0]) / 85) * 100}%`}
                height={6}
                backgroundColor={colors.shiftlyViolet}
                borderRadius={3}
              />
            </YStack>
            {/* Range inputs - using native HTML inputs for better compatibility */}
            <XStack
              position="absolute"
              width="100%"
              height="100%"
              alignItems="center"
              pointerEvents="box-none"
            >
              <input
                type="range"
                min={15}
                max={100}
                value={hourlyRate[0]}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val < hourlyRate[1]) {
                    handleHourlyRateChange(0, val);
                  }
                }}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                  zIndex: 10,
                  WebkitAppearance: "none",
                  appearance: "none",
                }}
              />
              <input
                type="range"
                min={15}
                max={100}
                value={hourlyRate[1]}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val > hourlyRate[0]) {
                    handleHourlyRateChange(1, val);
                  }
                }}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                  zIndex: 11,
                  WebkitAppearance: "none",
                  appearance: "none",
                }}
              />
            </XStack>
            {/* Visual handles */}
            <XStack
              position="absolute"
              width="100%"
              height="100%"
              alignItems="center"
              pointerEvents="none"
            >
              <XStack
                position="absolute"
                left={`${((hourlyRate[0] - 15) / 85) * 100}%`}
                transform={[{ translateX: -8 }]}
                width={16}
                height={16}
                borderRadius={8}
                backgroundColor={colors.shiftlyViolet}
                borderWidth={2}
                borderColor={colors.white}
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.1}
                shadowRadius={4}
              />
              <XStack
                position="absolute"
                left={`${((hourlyRate[1] - 15) / 85) * 100}%`}
                transform={[{ translateX: -8 }]}
                width={16}
                height={16}
                borderRadius={8}
                backgroundColor={colors.shiftlyViolet}
                borderWidth={2}
                borderColor={colors.white}
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.1}
                shadowRadius={4}
              />
            </XStack>
          </YStack>
        </YStack>
      </YStack>

      {/* Note */}
      <YStack gap="$2">
        <Text fontSize={14} fontWeight="600" color={colors.gray900}>
          Note
        </Text>
        <XStack gap="$2" flexWrap="wrap">
          {[1, 2, 3, 4, 5].map((rating) => {
            const isSelected = filters.rating === rating;
            return (
              <XStack
                key={rating}
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$3"
                borderWidth={2}
                borderColor={isSelected ? colors.shiftlyViolet : colors.gray200}
                backgroundColor={
                  isSelected ? colors.shiftlyViolet + "20" : colors.white
                }
                cursor="pointer"
                hoverStyle={{
                  borderColor: colors.shiftlyViolet,
                  backgroundColor: colors.shiftlyViolet + "20",
                }}
                onPress={() => handleRatingClick(rating)}
              >
                <Text
                  fontSize={14}
                  fontWeight={isSelected ? "600" : "400"}
                  color={isSelected ? colors.shiftlyViolet : colors.gray700}
                >
                  {rating} ★
                </Text>
              </XStack>
            );
          })}
        </XStack>
      </YStack>

      {/* Badges */}
      <RadioGroup
        label="Badges"
        options={badgeOptions}
        value={filters.badge}
        onChange={(value) => handleFilterChange("badge", value)}
        orientation="vertical"
      />
    </YStack>
  );
}
