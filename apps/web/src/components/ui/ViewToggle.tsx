"use client";

import { XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import type { ReactNode } from "react";

export type ViewMode = "grid" | "list" | "map";

interface ViewToggleOption {
  mode: ViewMode;
  icon: ReactNode;
  label?: string;
}

interface ViewToggleProps {
  currentMode: ViewMode;
  options: ViewToggleOption[];
  onModeChange: (mode: ViewMode) => void;
}

/**
 * Composant réutilisable pour basculer entre les modes d'affichage (grille/liste/carte)
 */
export function ViewToggle({
  currentMode,
  options,
  onModeChange,
}: ViewToggleProps) {
  return (
    <XStack marginLeft="auto" gap="$2">
      {options.map((option) => {
        const isActive = currentMode === option.mode;
        return (
          <XStack
            key={option.mode}
            paddingHorizontal="$3"
            paddingVertical="$2"
            backgroundColor={isActive ? colors.shiftlyViolet : colors.white}
            borderRadius="$3"
            borderWidth={1}
            borderColor={isActive ? colors.shiftlyViolet : colors.gray200}
            gap="$2"
            alignItems="center"
            cursor="pointer"
            hoverStyle={{
              borderColor: colors.shiftlyViolet,
              backgroundColor: isActive
                ? colors.shiftlyViolet
                : colors.shiftlyVioletLight,
            }}
            onPress={() => onModeChange(option.mode)}
          >
            {option.icon}
            {option.label && (
              <Text
                fontSize={13}
                color={isActive ? "#fff" : colors.gray900}
                fontWeight="600"
              >
                {option.label}
              </Text>
            )}
          </XStack>
        );
      })}
    </XStack>
  );
}

