import { Button as TButton, styled, Text, XStack } from "tamagui";
import React, { useState } from "react";

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
    scale: 0.98,
  },
  hoverStyle: {
    scale: 1.02,
  },
  focusStyle: {
    scale: 1.02,
    borderWidth: 2,
    borderColor: "$outlineColor",
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: "$primary",
        hoverStyle: {
          backgroundColor: "$primary",
          scale: 1.02,
          opacity: 0.95,
        },
        focusStyle: {
          backgroundColor: "$primary",
          scale: 1.02,
          borderWidth: 2,
          borderColor: "$outlineColor",
        },
        pressStyle: {
          backgroundColor: "$primary",
          scale: 0.98,
        },
      },
      secondary: {
        backgroundColor: "$primaryLight",
        borderColor: "$primary",
        hoverStyle: {
          backgroundColor: "$gold",
          color: "#000000",
          scale: 1.02,
        },
        focusStyle: {
          backgroundColor: "$primary",
          scale: 1.02,
          borderWidth: 2,
          borderColor: "$outlineColor",
        },
        pressStyle: {
          backgroundColor: "$gold",
          borderBlockColor: "$primary",
          scale: 0.98,
        },
      },
      ghost: {
        backgroundColor: "$surface",
        hoverStyle: {
          backgroundColor: "$primaryLight",
          scale: 1.02,
        },
        focusStyle: {
          backgroundColor: "$primaryLight",
          scale: 1.02,
          borderWidth: 2,
          borderColor: "$outlineColor",
        },
        pressStyle: {
          backgroundColor: "$primaryLight",
          scale: 0.98,
        },
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "$primary",
        hoverStyle: {
          backgroundColor: "transparent",
          borderColor: "$primary",
          scale: 1.02,
          opacity: 0.9,
        },
        focusStyle: {
          backgroundColor: "transparent",
          scale: 1.02,
          borderWidth: 2,
          borderColor: "$primary",
        },
        pressStyle: {
          backgroundColor: "transparent",
          scale: 0.98,
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
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  [key: string]: any;
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getTextColor = () => {
    if (isHovered && variant === "secondary") {
      return "#000000";
    }
    switch (variant) {
      case "primary":
        return "white";
      case "secondary":
        return "$primary";
      case "ghost":
        return "#000000";
      case "outline":
        return "$primary";
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

  // Fonction pour cloner les enfants et appliquer la couleur
  const cloneChildrenWithColor = (children: React.ReactNode, color: string): React.ReactNode => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        const childElement = child as React.ReactElement<any>;
        const childType = childElement.type;
        const childProps = childElement.props || {};
        
        // Si c'est un Text de Tamagui, appliquer la couleur
        if (childType === Text) {
          return React.cloneElement(childElement, {
            ...childProps,
            color: color,
          });
        }
        
        // Si c'est une fonction (probablement une icône Lucide), appliquer la couleur si elle accepte une prop color
        if (variant === "primary" && typeof childType === 'function') {
          // Les icônes Lucide acceptent généralement une prop 'color' et 'size'
          if (childProps.size !== undefined || childProps.color !== undefined || 
              childProps.style !== undefined) {
            return React.cloneElement(childElement, {
              ...childProps,
              color: color,
            });
          }
        }
        
        // Si c'est un XStack ou autre composant avec des enfants, cloner récursivement
        if (childProps.children) {
          return React.cloneElement(childElement, {
            ...childProps,
            children: cloneChildrenWithColor(childProps.children, color),
          });
        }
      }
      return child;
    });
  };

  // Vérifier si les enfants sont déjà des éléments React complexes (pas juste du texte)
  const isComplexChildren = React.isValidElement(children) || 
    (Array.isArray(children) && children.some(child => React.isValidElement(child)));

  const textColor = getTextColor();

  return (
    <StyledButton
      variant={variant}
      size={size}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {isComplexChildren ? (
        <XStack alignItems="center" justifyContent="space-between" width="100%">
          {variant === "primary" ? cloneChildrenWithColor(children, textColor) : children}
        </XStack>
      ) : (
        <Text
          color={textColor}
          textAlign="center"
          fontWeight="600"
          fontSize={getTextSize()}
        >
          {children}
        </Text>
      )}
    </StyledButton>
  );
};
