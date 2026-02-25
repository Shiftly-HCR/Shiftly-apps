"use client";

import { XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { ViewToggle, type ViewMode } from "./ViewToggle";
import type { ReactElement } from "react";
import { useResponsive } from "@/hooks";

interface ActiveFiltersProps {
  filters: string[];
  onRemoveFilter: (filter: string) => void;
  onClearAll: () => void;
  viewToggle?: {
    currentMode: ViewMode;
    options: Array<{ mode: ViewMode; icon: ReactElement; label?: string }>;
    onModeChange: (mode: ViewMode) => void;
  };
}

/**
 * Composant réutilisable pour afficher les filtres actifs
 */
export function ActiveFilters({
  filters,
  onRemoveFilter,
  onClearAll,
  viewToggle,
}: ActiveFiltersProps) {
  const { isMobile } = useResponsive();

  if (filters.length === 0 && !viewToggle) {
    return null;
  }

  return (
    <XStack
      paddingVertical={isMobile ? "$3" : "$4"}
      gap="$3"
      flexWrap="wrap"
      alignItems="center"
      marginBottom="$4"
    >
      {filters.length > 0 && (
        <>
          <Text fontSize={14} color={colors.gray700} fontWeight="600">
            Filtres actifs:
          </Text>

          {filters.map((filter) => (
            <XStack
              key={filter}
              paddingHorizontal="$3"
              paddingVertical="$1.5"
              backgroundColor={colors.white}
              borderRadius="$3"
              borderWidth={1}
              borderColor={colors.gray200}
              gap="$2"
              alignItems="center"
            >
              <Text fontSize={13} color={colors.gray900} fontWeight="500">
                {filter}
              </Text>
              <Text
                fontSize={16}
                color={colors.gray700}
                cursor="pointer"
                hoverStyle={{ color: "#EF4444" }}
                onPress={() => onRemoveFilter(filter)}
              >
                ✕
              </Text>
            </XStack>
          ))}

          <Text
            fontSize={13}
            color={colors.shiftlyViolet}
            fontWeight="600"
            cursor="pointer"
            textDecorationLine="underline"
            hoverStyle={{ opacity: 0.8 }}
            onPress={onClearAll}
          >
            Effacer tout
          </Text>
        </>
      )}

      {viewToggle && (
        <ViewToggle
          currentMode={viewToggle.currentMode}
          options={viewToggle.options}
          onModeChange={viewToggle.onModeChange}
        />
      )}
    </XStack>
  );
}
