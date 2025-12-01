"use client";

import { YStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import type { ReactNode } from "react";

interface PageSectionProps {
  title: string;
  children: ReactNode;
  gap?: string;
}

/**
 * Composant réutilisable pour une section de page avec titre
 */
export function PageSection({ title, children, gap = "$4" }: PageSectionProps) {
  return (
    <YStack gap={gap}>
      <Text fontSize={20} fontWeight="700" color={colors.gray900}>
        {title}
      </Text>
      {children}
    </YStack>
  );
}

