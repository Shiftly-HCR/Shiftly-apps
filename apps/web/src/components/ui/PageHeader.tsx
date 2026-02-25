"use client";

import { YStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { useResponsive } from "@/hooks";

interface PageHeaderProps {
  title: string;
  description?: string;
  align?: "left" | "center";
}

/**
 * Composant réutilisable pour les en-têtes de page
 */
export function PageHeader({
  title,
  description,
  align = "left",
}: PageHeaderProps) {
  const { isMobile } = useResponsive();

  return (
    <YStack
      gap="$3"
      marginBottom={isMobile ? "$4" : "$6"}
      alignItems={align === "center" ? "center" : "flex-start"}
    >
      <Text
        fontSize={isMobile ? 24 : 32}
        fontWeight="700"
        color={colors.gray900}
        textAlign={align}
        marginBottom={description ? "$2" : 0}
      >
        {title}
      </Text>
      {description && (
        <Text
          fontSize={isMobile ? 14 : 16}
          color={colors.gray700}
          textAlign={align}
          maxWidth={align === "center" ? 600 : undefined}
        >
          {description}
        </Text>
      )}
    </YStack>
  );
}

