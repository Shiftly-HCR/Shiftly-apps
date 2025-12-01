"use client";

import { YStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";

interface StatusBadgeProps {
  label: string;
  backgroundColor: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  top?: number;
  right?: number;
  left?: number;
  bottom?: number;
}

/**
 * Composant réutilisable pour afficher un badge de statut
 */
export function StatusBadge({
  label,
  backgroundColor,
  position = "top-right",
  top,
  right,
  left,
  bottom,
}: StatusBadgeProps) {
  const positionStyles = {
    "top-left": { top: top ?? 12, left: left ?? 12 },
    "top-right": { top: top ?? 12, right: right ?? 12 },
    "bottom-left": { bottom: bottom ?? 12, left: left ?? 12 },
    "bottom-right": { bottom: bottom ?? 12, right: right ?? 12 },
  };

  const styleProps = positionStyles[position];

  return (
    <YStack
      position="absolute"
      {...styleProps}
      zIndex={10}
      paddingHorizontal="$3"
      paddingVertical="$1.5"
      borderRadius={20}
      backgroundColor={backgroundColor}
      alignSelf={position.includes("left") ? "flex-start" : position.includes("right") ? "flex-end" : "center"}
    >
      <Text fontSize={12} color={colors.white} fontWeight="600" textTransform={position === "top-left" && top === -12 ? "uppercase" : undefined}>
        {label}
      </Text>
    </YStack>
  );
}

