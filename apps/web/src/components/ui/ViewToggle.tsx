"use client";

import { XStack, YStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import React, { type ReactElement } from "react";

export type ViewMode = "grid" | "list" | "map";

interface ViewToggleOption {
  mode: ViewMode;
  icon: ReactElement;
  label?: string;
}

interface ViewToggleProps {
  currentMode: ViewMode;
  options: ViewToggleOption[];
  onModeChange: (mode: ViewMode) => void;
}

/**
 * Composant réutilisable pour basculer entre les modes d'affichage (grille/liste/carte)
 * avec un effet de slide du fond violet
 */
export function ViewToggle({
  currentMode,
  options,
  onModeChange,
}: ViewToggleProps) {
  const activeIndex = options.findIndex((opt) => opt.mode === currentMode);
  const buttonWidth = 100 / options.length;

  return (
    <XStack
      marginLeft="auto"
      position="relative"
      backgroundColor={colors.white}
      borderRadius="$3"
      borderWidth={1}
      borderColor={colors.gray200}
      padding="$1"
      gap={0}
    >
      {/* Fond violet qui slide */}
      <YStack
        position="absolute"
        top="$1"
        left={`calc(${activeIndex * buttonWidth}% + 4px)`}
        width={`calc(${buttonWidth}% - 8px)`}
        height="calc(100% - 8px)"
        backgroundColor={colors.shiftlyViolet}
        borderRadius="$2"
        style={{
          transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        zIndex={0}
      />

      {options.map((option, index) => {
        const isActive = currentMode === option.mode;

        // Clone l'icône pour lui appliquer la couleur
        const iconWithColor = React.isValidElement(option.icon)
          ? React.cloneElement(option.icon as ReactElement<any>, {
              color: isActive ? "white" : colors.gray700,
              size: (option.icon as any).props?.size || 16,
            })
          : option.icon;

        return (
          <XStack
            key={option.mode}
            position="relative"
            zIndex={1}
            paddingHorizontal="$3"
            paddingVertical="$2"
            gap="$2"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            flex={1}
            onPress={() => onModeChange(option.mode)}
          >
            {iconWithColor}
            {option.label && (
              <Text
                fontSize={13}
                color={isActive ? "white" : colors.gray900}
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
