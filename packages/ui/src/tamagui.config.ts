import { createTamagui, createTokens } from "tamagui";
import { getDefaultTamaguiConfig } from "@tamagui/config-default";
import {
  shiftlyLight,
  shiftlyDark,
  shiftlyPremium,
  radius,
  spacing,
  colors,
} from "./theme";

// Tokens (spacing / radius / color)
const tokens = createTokens({
  color: {
    background: shiftlyLight.background,
    backgroundHover: "#f5f5f5",
    backgroundPress: "#f0f0f0",
    backgroundFocus: "#e0e0e0",
    color: shiftlyLight.color,
    colorHover: "#333333",
    colorPress: "#666666",
    colorFocus: "#999999",
    primary: shiftlyLight.primary,
    secondary: shiftlyLight.secondary,
    surface: shiftlyLight.surface,
    muted: shiftlyLight.muted,
    borderColor: shiftlyLight.borderColor,
    borderColorHover: "#d0d0d0",
    borderColorPress: "#c0c0c0",
    borderColorFocus: "#b0b0b0",
    placeholderColor: "#999999",
    violet9: colors.shiftlyViolet,
    violet10: colors.shiftlyMauve,
    gray10: "#6b7280",
    gray8: "#6b7280",
    gray11: "#374151",
    gray12: "#1f2937",
    red10: "#dc2626",
    violet8: colors.shiftlyViolet,
    // Tokens legacy pour compatibilité (à remplacer progressivement)
    orange9: colors.shiftlyViolet,
    orange10: colors.shiftlyMauve,
    orange8: colors.shiftlyViolet,
    outlineColor: "#3b82f6",
    black: colors.black,
    white: colors.white,
    primaryLight: shiftlyLight.primaryLight,
    gold: shiftlyLight.gold,
  },
  radius: {
    $true: 8,
    0: 0,
    1: 2,
    2: 4,
    3: 6,
    4: 8,
    5: 10,
    6: 12,
    7: 14,
    8: 16,
    sm: radius.sm,
    md: radius.md,
    lg: radius.lg,
  },
  space: {
    $true: 16,
    ...spacing,
  },
  size: {
    $true: 16,
    ...spacing,
  },
  zIndex: {
    0: 0,
    1: 1,
    10: 10,
    100: 100,
    1000: 1000,
  },
});

const configDefault = getDefaultTamaguiConfig();

export const config = createTamagui({
  ...configDefault,
  themeClassNameOnRoot: true,
  defaultTheme: "light",
  tokens,
  themes: {
    light: shiftlyLight,
    dark: shiftlyDark,
    premium: shiftlyPremium,
  },
});

export type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
