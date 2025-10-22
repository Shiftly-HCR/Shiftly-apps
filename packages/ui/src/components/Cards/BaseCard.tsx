import { YStack, styled } from "tamagui";
import React from "react";

const StyledCard = styled(YStack, {
  name: "BaseCard",
  backgroundColor: "$background",
  borderRadius: "$4",
  borderWidth: 1,
  borderColor: "$borderColor",
  padding: "$4",
  shadowColor: "rgba(0, 0, 0, 0.08)",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 8,
  elevation: 2,
  hoverStyle: {
    borderColor: "$primary",
    shadowColor: "rgba(0, 0, 0, 0.12)",
    scale: 1.01,
  },
  pressStyle: {
    scale: 0.98,
  },
  variants: {
    elevated: {
      true: {
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
        hoverStyle: {
          shadowColor: "rgba(0, 0, 0, 0.15)",
        },
      },
    },
    clickable: {
      true: {
        cursor: "pointer",
      },
    },
  } as const,
});

interface BaseCardProps {
  children: React.ReactNode;
  elevated?: boolean;
  clickable?: boolean;
  onPress?: () => void;
  [key: string]: any;
}

export const BaseCard = ({
  children,
  elevated = false,
  clickable = false,
  onPress,
  ...props
}: BaseCardProps) => {
  return (
    <StyledCard
      elevated={elevated}
      clickable={clickable || !!onPress}
      onPress={onPress}
      {...props}
    >
      {children}
    </StyledCard>
  );
};
