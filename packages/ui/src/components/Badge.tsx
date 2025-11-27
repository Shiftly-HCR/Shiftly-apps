import { SizableText, XStack, styled } from "tamagui";
import { ReactNode } from "react";

export type BadgeVariant =
  | "default"
  | "premium"
  | "certified"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "new"
  | "urgent"
  | "inProgress"
  | "cancelled"
  | "completed";

export type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
}

const variantStyles = {
  default: {
    bg: "#F3F3F3",
    color: "#2B2B2B",
    borderColor: "#E5E5E5",
  },
  premium: {
    bg: "#FFF9ED",
    color: "#CC9933",
    borderColor: "#CC9933",
  },
  certified: {
    bg: "#EBF5FF",
    color: "#2563EB",
    borderColor: "#2563EB",
  },
  success: {
    bg: "#F0FDF4",
    color: "#15803D",
    borderColor: "#22C55E",
  },
  warning: {
    bg: "#FFF7ED",
    color: "#C2410C",
    borderColor: "#782478",
  },
  error: {
    bg: "#FEF2F2",
    color: "#B91C1C",
    borderColor: "#EF4444",
  },
  info: {
    bg: "#F0F9FF",
    color: "#0369A1",
    borderColor: "#0EA5E9",
  },
  new: {
    bg: "#F5F3FF",
    color: "#6D28D9",
    borderColor: "#8B5CF6",
  },
  urgent: {
    bg: "#FEF2F2",
    color: "#B91C1C",
    borderColor: "#EF4444",
  },
  inProgress: {
    bg: "#F5F3FF",
    color: "#782478",
    borderColor: "#782478",
  },
  cancelled: {
    bg: "#F9FAFB",
    color: "#6B7280",
    borderColor: "#9CA3AF",
  },
  completed: {
    bg: "#F0FDF4",
    color: "#15803D",
    borderColor: "#22C55E",
  },
};

const sizeStyles = {
  sm: {
    px: "$2",
    py: "$0.5",
    fontSize: "$1" as const,
  },
  md: {
    px: "$3",
    py: "$1",
    fontSize: "$2" as const,
  },
  lg: {
    px: "$4",
    py: "$1.5",
    fontSize: "$3" as const,
  },
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  icon,
}: BadgeProps) {
  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  return (
    <XStack
      alignItems="center"
      justifyContent="center"
      gap="$1.5"
      paddingHorizontal={sizes.px}
      paddingVertical={sizes.py}
      borderRadius="$4"
      backgroundColor={styles.bg}
      borderColor={styles.borderColor}
      borderWidth={1}
    >
      {icon && <XStack alignItems="center">{icon}</XStack>}
      <SizableText size={sizes.fontSize} fontWeight="600" color={styles.color}>
        {children}
      </SizableText>
    </XStack>
  );
}
