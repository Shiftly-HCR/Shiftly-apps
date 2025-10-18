"use client";

import { TamaguiProvider as TamaguiProviderBase } from "tamagui";
import { createTamagui } from "tamagui";

// Configuration Tamagui minimale qui fonctionne
const config = {
  tokens: {
    color: {
      background: "#ffffff",
      backgroundHover: "#f5f5f5",
      backgroundPress: "#f0f0f0",
      backgroundFocus: "#e0e0e0",
      color: "#000000",
      colorHover: "#333333",
      colorPress: "#666666",
      colorFocus: "#999999",
      borderColor: "#e0e0e0",
      borderColorHover: "#d0d0d0",
      borderColorPress: "#c0c0c0",
      borderColorFocus: "#b0b0b0",
      placeholderColor: "#999999",
      orange9: "#f97316",
      orange10: "#ea580c",
      gray10: "#6b7280",
    },
    space: {
      $true: 16,
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      5: 20,
      6: 24,
      7: 28,
      8: 32,
    },
    size: {
      $true: 16,
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      5: 20,
      6: 24,
      7: 28,
      8: 32,
    },
    radius: {
      0: 0,
      1: 2,
      2: 4,
      3: 6,
      4: 8,
      5: 10,
      6: 12,
      7: 14,
      8: 16,
    },
    zIndex: {
      0: 0,
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
    },
  },
  themes: {
    light: {
      background: "#ffffff",
      backgroundHover: "#f5f5f5",
      backgroundPress: "#f0f0f0",
      backgroundFocus: "#e0e0e0",
      color: "#000000",
      colorHover: "#333333",
      colorPress: "#666666",
      colorFocus: "#999999",
      borderColor: "#e0e0e0",
      borderColorHover: "#d0d0d0",
      borderColorPress: "#c0c0c0",
      borderColorFocus: "#b0b0b0",
      placeholderColor: "#999999",
    },
  },
  fonts: {
    body: {
      family: "system-ui, sans-serif",
      size: {
        1: 12,
        2: 14,
        3: 16,
        4: 18,
        5: 20,
        6: 24,
        7: 28,
        8: 32,
      },
    },
  },
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: "none" },
    pointerCoarse: { pointer: "coarse" },
  },
  animations: {
    bouncy: {
      type: "spring",
      damping: 10,
      mass: 0.9,
      stiffness: 100,
    },
    lazy: {
      type: "spring",
      damping: 20,
      stiffness: 60,
    },
    quick: {
      type: "spring",
      damping: 20,
      mass: 1.2,
      stiffness: 250,
    },
  },
};

// Créer la configuration Tamagui
const tamaguiConfig = createTamagui(config);

export function TamaguiProvider({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProviderBase config={tamaguiConfig} defaultTheme="light">
      {children}
    </TamaguiProviderBase>
  );
}
