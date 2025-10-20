import { Button as TButton, styled, Text } from "tamagui";
import React from "react";

const StyledButton = styled(TButton, {
  name: "Button",
  backgroundColor: "$primary",
  borderRadius: "$4",
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderWidth: 0,
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  minHeight: 44,
  pressStyle: {
    scale: 0.95,
    opacity: 0.8,
  },
  hoverStyle: {
    scale: 1.05,
    opacity: 0.9,
  },
  focusStyle: {
    scale: 1.05,
    opacity: 0.9,
    borderWidth: 2,
    borderColor: "$outlineColor",
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: "$primary",
        hoverStyle: {
          backgroundColor: "$primary",
          scale: 1.05,
          opacity: 0.9,
        },
        focusStyle: {
          backgroundColor: "$primary",
          scale: 1.05,
          opacity: 0.9,
          borderWidth: 2,
          borderColor: "$outlineColor",
        },
        pressStyle: {
          backgroundColor: "$primary",
          scale: 0.95,
          opacity: 0.8,
        },
      },
      secondary: {
        backgroundColor: "$primaryLight",
        borderColor: "$primary",
        hoverStyle: {
          backgroundColor: "$gold",
          color: "#000000",
          scale: 1.05,
          opacity: 0.9,
        },
        focusStyle: {
          backgroundColor: "$primary",
          scale: 1.05,
          opacity: 0.9,
          borderWidth: 2,
          borderColor: "$outlineColor",
        },
        pressStyle: {
          backgroundColor: "$gold",
          borderBlockColor: "$primary",
          scale: 0.95,
          opacity: 0.8,
        },
      },
      ghost: {
        backgroundColor: "$surface",
        hoverStyle: {
          backgroundColor: "$primaryLight",
          scale: 1.05,
          opacity: 0.9,
        },
        focusStyle: {
          backgroundColor: "$primaryLight",
          scale: 1.05,
          opacity: 0.9,
          borderWidth: 2,
          borderColor: "$outlineColor",
        },
        pressStyle: {
          backgroundColor: "$primaryLight",
          scale: 0.95,
          opacity: 0.8,
        },
      },
    },
    size: {
      sm: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        minHeight: 36,
      },
      md: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 44,
      },
      lg: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        minHeight: 52,
      },
    },
  } as const,
});

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  [key: string]: any;
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) => {
  const getTextColor = () => {
    switch (variant) {
      case "primary":
        return "white";
      case "secondary":
        return "$primary";
      case "ghost":
        return "#000000";
      default:
        return "white";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return 14;
      case "md":
        return 16;
      case "lg":
        return 18;
      default:
        return 16;
    }
  };

  return (
    <StyledButton variant={variant} size={size} {...props}>
      <Text
        color={getTextColor()}
        textAlign="center"
        fontWeight="600"
        fontSize={getTextSize()}
      >
        {children}
      </Text>
    </StyledButton>
  );
};
