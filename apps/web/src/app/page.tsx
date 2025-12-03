"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionCache } from "@/hooks/cache/useSessionCache";
import { YStack, Text } from "tamagui";

export default function Home() {
  const router = useRouter();
  const { cache, isLoading } = useSessionCache();

  useEffect(() => {
    // Attendre que le cache soit chargé
    if (isLoading) return;

    if (cache?.user && cache?.profile) {
      // Utilisateur connecté → redirection selon le rôle
      if (cache.profile.role === "commercial") {
        router.push("/commercial");
      } else {
        router.push("/home");
      }
    } else {
      // Utilisateur non connecté → redirection vers /login
      router.push("/login");
    }
  }, [cache, isLoading, router]);

  // Affichage temporaire pendant la redirection
  return (
    <YStack
      flex={1}
      backgroundColor="#F9FAFB"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <Text fontSize={16} color="#6B7280">
        Redirection...
      </Text>
    </YStack>
  );
}
