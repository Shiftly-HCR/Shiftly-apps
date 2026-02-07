import React, { useState, useEffect } from "react";
import { YStack, XStack, Text } from "tamagui";
import { Select } from "./form/Select";
import { RadioGroup } from "./form/RadioGroup";
import { colors } from "../theme";

const DAILY_RATE_MIN = 80;
const DAILY_RATE_MAX = 400;
const DAILY_RATE_RANGE = DAILY_RATE_MAX - DAILY_RATE_MIN;

export interface FreelanceFiltersState {
  position?: string;
  location?: string;
  availability?: string;
  dailyRateMin?: number;
  dailyRateMax?: number;
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
  { label: "Tous", value: "all" },
  { label: "Certifié", value: "certified" },
  { label: "Shiftly+", value: "shiftly_plus" },
];

export function FreelanceFilters({
  filters,
  onFiltersChange,
}: FreelanceFiltersProps) {
  const [dailyRate, setDailyRate] = useState<[number, number]>([
    filters.dailyRateMin ?? DAILY_RATE_MIN,
    filters.dailyRateMax ?? DAILY_RATE_MAX,
  ]);

  // Sync local slider state when filters change from outside (e.g. removeFilter clears rate)
  useEffect(() => {
    setDailyRate([
      filters.dailyRateMin ?? DAILY_RATE_MIN,
      filters.dailyRateMax ?? DAILY_RATE_MAX,
    ]);
  }, [filters.dailyRateMin, filters.dailyRateMax]);

  const handleFilterChange = (key: keyof FreelanceFiltersState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleDailyRateChange = (index: 0 | 1, value: number) => {
    const newRate: [number, number] = [...dailyRate];
    newRate[index] = value;
    setDailyRate(newRate);

    if (index === 0 && value > dailyRate[1]) {
      newRate[1] = value;
    } else if (index === 1 && value < dailyRate[0]) {
      newRate[0] = value;
    }

    onFiltersChange({
      ...filters,
      dailyRateMin: newRate[0],
      dailyRateMax: newRate[1],
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

      {/* TJM (taux journalier) */}
      <YStack gap="$2">
        <Text fontSize={14} fontWeight="600" color={colors.gray900}>
          TJM (€ / jour)
        </Text>
        <YStack gap="$3">
          <XStack
            gap="$2"
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal="$2"
          >
            <Text fontSize={14} color={colors.gray700} fontWeight="500">
              {dailyRate[0]}€
            </Text>
            <Text fontSize={14} color={colors.gray700} fontWeight="500">
              {dailyRate[1]}€
            </Text>
          </XStack>
          <YStack
            position="relative"
            height={40}
            justifyContent="center"
            paddingHorizontal="$1"
          >
            <YStack
              height={6}
              backgroundColor={colors.gray200}
              borderRadius={3}
              position="relative"
              width="100%"
            >
              <YStack
                position="absolute"
                left={`${((dailyRate[0] - DAILY_RATE_MIN) / DAILY_RATE_RANGE) * 100}%`}
                width={`${((dailyRate[1] - dailyRate[0]) / DAILY_RATE_RANGE) * 100}%`}
                height={6}
                backgroundColor={colors.shiftlyViolet}
                borderRadius={3}
              />
            </YStack>
            <XStack
              position="absolute"
              width="100%"
              height="100%"
              alignItems="center"
              pointerEvents="box-none"
            >
              <input
                type="range"
                min={DAILY_RATE_MIN}
                max={DAILY_RATE_MAX}
                value={dailyRate[0]}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val < dailyRate[1]) {
                    handleDailyRateChange(0, val);
                  }
                }}
                style={{
                  position: "absolute",
                  left: 0,
                  width: `${((dailyRate[1] - DAILY_RATE_MIN) / DAILY_RATE_RANGE) * 100}%`,
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
                min={DAILY_RATE_MIN}
                max={DAILY_RATE_MAX}
                value={dailyRate[1]}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val > dailyRate[0]) {
                    handleDailyRateChange(1, val);
                  }
                }}
                style={{
                  position: "absolute",
                  left: `${((dailyRate[0] - DAILY_RATE_MIN) / DAILY_RATE_RANGE) * 100}%`,
                  width: `${((DAILY_RATE_MAX - dailyRate[0]) / DAILY_RATE_RANGE) * 100}%`,
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                  zIndex: 11,
                  WebkitAppearance: "none",
                  appearance: "none",
                }}
              />
            </XStack>
            <XStack
              position="absolute"
              width="100%"
              height="100%"
              alignItems="center"
              pointerEvents="none"
            >
              <XStack
                position="absolute"
                left={`${((dailyRate[0] - DAILY_RATE_MIN) / DAILY_RATE_RANGE) * 100}%`}
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
                left={`${((dailyRate[1] - DAILY_RATE_MIN) / DAILY_RATE_RANGE) * 100}%`}
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
        value={filters.badge ?? "all"}
        onChange={(value) =>
          handleFilterChange("badge", value === "all" ? undefined : value)
        }
        orientation="vertical"
      />
    </YStack>
  );
}
