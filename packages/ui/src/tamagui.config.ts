import { createTamagui, createTokens } from "tamagui";
import { config as configDefault } from "@tamagui/config-default";
import {
  hestiaLight,
  hestiaDark,
  hestiaPremium,
  radius,
  spacing,
  colors,
} from "./theme";

// Tokens (spacing / radius / color)
const tokens = createTokens({
  color: {
    background: hestiaLight.background,
    backgroundHover: "#f5f5f5",
    backgroundPress: "#f0f0f0",
    backgroundFocus: "#e0e0e0",
    color: hestiaLight.color,
    colorHover: "#333333",
    colorPress: "#666666",
    colorFocus: "#999999",
    primary: hestiaLight.primary,
    secondary: hestiaLight.secondary,
    surface: hestiaLight.surface,
    muted: hestiaLight.muted,
    borderColor: hestiaLight.borderColor,
    borderColorHover: "#d0d0d0",
    borderColorPress: "#c0c0c0",
    borderColorFocus: "#b0b0b0",
    placeholderColor: "#999999",
    orange9: "#f97316",
    orange10: "#ea580c",
    gray10: "#6b7280",
    gray8: "#6b7280",
    gray11: "#374151",
    gray12: "#1f2937",
    red10: "#dc2626",
    orange8: "#ea580c",
    outlineColor: "#3b82f6",
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

export const config = createTamagui({
  ...configDefault,
  themeClassNameOnRoot: true,
  defaultTheme: "light",
  tokens,
  themes: {
    light: hestiaLight,
    dark: hestiaDark,
    premium: hestiaPremium,
  },
});

export type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
