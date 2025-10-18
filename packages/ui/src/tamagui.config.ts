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
    color: hestiaLight.color,
    primary: hestiaLight.primary,
    secondary: hestiaLight.secondary,
    surface: hestiaLight.surface,
    muted: hestiaLight.muted,
    border: hestiaLight.borderColor,
  },
  radius: {
    sm: radius.sm,
    md: radius.md,
    lg: radius.lg,
  },
  space: spacing,
  size: spacing,
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
