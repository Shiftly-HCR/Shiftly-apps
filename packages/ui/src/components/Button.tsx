import { Button as TButton, styled } from "tamagui";

export const Button = styled(TButton, {
  name: "Button",
  backgroundColor: "$primary",
  color: "white",
  borderRadius: "$4",
  paddingHorizontal: "$4",
  paddingVertical: "$3",
  fontSize: "$4",
  fontWeight: "600",
  borderWidth: 0,
  cursor: "pointer",
  pressStyle: {
    backgroundColor: "$primary",
    opacity: 0.8,
    scale: 0.98,
  },
  hoverStyle: {
    backgroundColor: "$primary",
    opacity: 0.9,
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: "$primary",
        color: "white",
      },
      secondary: {
        backgroundColor: "transparent",
        color: "$primary",
        borderWidth: 2,
        borderColor: "$primary",
        pressStyle: {
          backgroundColor: "$primary",
          color: "white",
          opacity: 1,
        },
      },
      ghost: {
        backgroundColor: "transparent",
        color: "$primary",
        pressStyle: {
          backgroundColor: "$surface",
          opacity: 1,
        },
      },
    },
    size: {
      sm: {
        paddingHorizontal: "$3",
        paddingVertical: "$2",
        fontSize: "$3",
      },
      md: {
        paddingHorizontal: "$4",
        paddingVertical: "$3",
        fontSize: "$4",
      },
      lg: {
        paddingHorizontal: "$5",
        paddingVertical: "$4",
        fontSize: "$5",
      },
    },
  } as const,
});
