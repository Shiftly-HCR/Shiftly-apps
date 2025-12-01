"use client";

import { YStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title: string;
  items: FAQItem[];
  backgroundColor?: string;
  marginTop?: string;
}

/**
 * Composant réutilisable pour afficher une section FAQ (Questions fréquentes)
 */
export function FAQSection({
  title,
  items,
  backgroundColor = colors.gray050,
  marginTop = "$8",
}: FAQSectionProps) {
  return (
    <YStack
      marginTop={marginTop}
      padding="$6"
      backgroundColor={backgroundColor}
      borderRadius={12}
      gap="$4"
    >
      <Text fontSize={20} fontWeight="700" color={colors.gray900}>
        {title}
      </Text>
      <YStack gap="$3">
        {items.map((item, index) => (
          <YStack key={index} gap="$1">
            <Text fontSize={16} fontWeight="600" color={colors.gray900}>
              {item.question}
            </Text>
            <Text fontSize={14} color={colors.gray700} lineHeight={20}>
              {item.answer}
            </Text>
          </YStack>
        ))}
      </YStack>
    </YStack>
  );
}

