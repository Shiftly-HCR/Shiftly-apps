"use client";

import { YStack, Text, XStack } from "tamagui";
import { useSessionContext } from "../providers/SessionProvider";
import { colors } from "@shiftly/ui";

/**
 * Composant de debug pour afficher les statistiques du cache de session
 * Visible uniquement en mode développement
 */
export function SessionCacheDebug() {
  const { cache, getRequestCount } = useSessionContext();

  // Ne rien afficher en production
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const requestCount = getRequestCount();
  const cacheAge = cache?.cachedAt
    ? Math.floor((Date.now() - cache.cachedAt) / 1000)
    : null;

  return (
    <YStack
      position="fixed"
      bottom={16}
      right={16}
      padding="$3"
      backgroundColor={colors.white}
      borderRadius={8}
      borderWidth={1}
      borderColor={colors.gray200}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={8}
      zIndex={9999}
      minWidth={200}
    >
      <Text fontSize={12} fontWeight="700" color={colors.gray900} marginBottom="$2">
        🔍 Session Cache Debug
      </Text>
      <YStack gap="$1">
        <XStack justifyContent="space-between">
          <Text fontSize={11} color={colors.gray600}>
            Requêtes Supabase:
          </Text>
          <Text fontSize={11} fontWeight="600" color={colors.gray900}>
            {requestCount}
          </Text>
        </XStack>
        {cacheAge !== null && (
          <XStack justifyContent="space-between">
            <Text fontSize={11} color={colors.gray600}>
              Cache age:
            </Text>
            <Text fontSize={11} fontWeight="600" color={colors.gray900}>
              {cacheAge}s
            </Text>
          </XStack>
        )}
        <XStack justifyContent="space-between">
          <Text fontSize={11} color={colors.gray600}>
            User ID:
          </Text>
          <Text fontSize={11} fontWeight="600" color={colors.gray900}>
            {cache?.userId ? cache.userId.substring(0, 8) + "..." : "N/A"}
          </Text>
        </XStack>
        <XStack justifyContent="space-between">
          <Text fontSize={11} color={colors.gray600}>
            Role:
          </Text>
          <Text fontSize={11} fontWeight="600" color={colors.gray900}>
            {cache?.profile?.role || "N/A"}
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}

