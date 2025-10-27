"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@hestia/data";
import { YStack, Text } from "tamagui";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const user = await getCurrentUser();

      if (user) {
        // Utilisateur connecté → redirection vers /home
        router.push("/home");
      } else {
        // Utilisateur non connecté → redirection vers /login
        router.push("/login");
      }
    };

    checkAuthAndRedirect();
  }, [router]);

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
