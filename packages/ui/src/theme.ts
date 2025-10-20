// Tokens & thèmes Hestia
export const colors = {
  hestiaOrange: "#FF5900",
  hestiaGold: "#CC9933",
  gray900: "#2B2B2B",
  gray050: "#F3F3F3",
  white: "#FFFFFF",
  black: "#000000",
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
};

export const hestiaLight = {
  background: colors.white,
  color: colors.gray900,
  primary: colors.hestiaOrange,
  primaryLight: "rgba(255, 89, 0, 0.1)",
  secondary: colors.gray900,
  gold: colors.hestiaGold,
  surface: colors.gray050,
  muted: "#EAEAEA",
  borderColor: "#E5E5E5",
  black: colors.black,
};

export const hestiaDark = {
  background: "#121212",
  color: colors.white,
  primary: colors.hestiaOrange,
  primaryLight: "rgba(255, 89, 0, 0.1)",
  secondary: colors.gray050,
  gold: colors.hestiaGold,
  surface: "#1B1B1B",
  muted: "#2A2A2A",
  borderColor: "#2A2A2A",
  black: colors.black,
};

export const hestiaPremium = {
  ...hestiaLight,
  primary: colors.hestiaGold,
};
