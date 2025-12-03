"use client";

import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface SecretCodeDisplayProps {
  code: string;
  id: string; // ID pour identifier quel code a été copié
}

/**
 * Composant pour afficher un code secret avec fonctionnalité de copie
 */
export function SecretCodeDisplay({ code, id }: SecretCodeDisplayProps) {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch (err) {
      console.error("Erreur lors de la copie:", err);
    }
  };

  return (
    <YStack
      padding="$2"
      backgroundColor={colors.backgroundLight}
      borderRadius="$2"
      gap="$1"
    >
      <Text fontSize={12} color={colors.gray500} fontWeight="600">
        Code secret
      </Text>
      <XStack alignItems="center" gap="$2">
        <Text fontSize={16} fontWeight="700" color={colors.shiftlyViolet} flex={1}>
          {code}
        </Text>
        <XStack
          onPress={handleCopyCode}
          width={32}
          height={32}
          alignItems="center"
          justifyContent="center"
          borderRadius="$2"
          cursor="pointer"
          hoverStyle={{
            backgroundColor: colors.gray100,
          }}
        >
          {copiedCodeId === id ? (
            <Check size={16} color={colors.shiftlyViolet} />
          ) : (
            <Copy size={16} color={colors.gray500} />
          )}
        </XStack>
        {copiedCodeId === id && (
          <Text fontSize={12} color={colors.shiftlyViolet}>
            Copié !
          </Text>
        )}
      </XStack>
    </YStack>
  );
}

