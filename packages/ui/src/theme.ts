// Tokens & thèmes Shiftly
export const colors = {
  shiftlyViolet: "#782478",
  shiftlyVioletHover: "#5A1A5A",
  shiftlyVioletLight: "#F5F0F7",
  shiftlyMauve: "#4c114f",
  shiftlyMarron: "#503342",
  shiftlyGris: "#bdaaa1",
  shiftlyGold: "#CC9933",
  white: "#FFFFFF", // Blanc pur pour un rendu neutre
  whiteViolet: "#FAF8FC", // Blanc avec teinte violette subtile (optionnel)
  gray900: "#2B2B2B",
  gray700: "#6B7280",
  gray500: "#9CA3AF",
  gray200: "#E5E5E5",
  gray100: "#EAEAEA",
  gray050: "#F3F3F3",
  black: "#000000",
  backgroundLight: "#F9FAFB",
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

export const shiftlyLight = {
  background: colors.white,
  backgroundLight: colors.backgroundLight,
  color: colors.gray900,
  colorSecondary: colors.gray700,
  colorTertiary: colors.gray500,
  primary: colors.shiftlyViolet,
  primaryHover: colors.shiftlyVioletHover,
  primaryLight: "rgba(120, 36, 120, 0.1)",
  secondary: colors.gray900,
  gold: colors.shiftlyGold,
  surface: colors.gray050,
  muted: colors.gray100,
  borderColor: colors.gray200,
  black: colors.black,
};

export const shiftlyDark = {
  background: "#121212",
  color: colors.white,
  primary: colors.shiftlyViolet,
  primaryLight: "rgba(120, 36, 120, 0.1)",
  secondary: colors.gray050,
  gold: colors.shiftlyGold,
  surface: "#1B1B1B",
  muted: "#2A2A2A",
  borderColor: "#2A2A2A",
  black: colors.black,
};

export const shiftlyPremium = {
  ...shiftlyLight,
  primary: colors.shiftlyGold,
};
