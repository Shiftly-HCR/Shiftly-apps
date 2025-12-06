"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionCache } from "@/hooks/cache/useSessionCache";
import { getSession } from "@shiftly/data";
import { YStack, Text } from "tamagui";

export default function Home() {
  const router = useRouter();
  const { cache, isLoading } = useSessionCache();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Attendre que le cache soit chargé
      if (isLoading) return;

      // Vérifier aussi la session Supabase directement pour être sûr
      // que l'utilisateur est vraiment déconnecté
      try {
        const session = await getSession();

        // Si pas de session Supabase, rediriger vers login immédiatement
        if (!session) {
          setIsCheckingSession(false);
          router.push("/login");
          return;
        }

        // Si on a une session Supabase mais pas encore de cache,
        // attendre un peu que le SessionProvider charge le cache
        if (!cache && session) {
          // Le cache devrait se charger bientôt via le SessionProvider
          // On attend un peu puis on vérifie à nouveau
          const timeoutId = setTimeout(() => {
            setIsCheckingSession(false);
          }, 1000);
          return () => clearTimeout(timeoutId);
        }

        setIsCheckingSession(false);

        // Si on a un cache avec user et profile, rediriger selon le rôle
        if (cache?.user && cache?.profile) {
          if (cache.profile.role === "commercial") {
            router.push("/commercial");
          } else {
            router.push("/home");
          }
        } else if (session) {
          // On a une session mais pas de cache complet, attendre encore un peu
          // ou rediriger vers login si ça prend trop de temps
          setTimeout(() => {
            if (!cache?.user || !cache?.profile) {
              router.push("/login");
            }
          }, 2000);
        } else {
          // Pas de session ni de cache → rediriger vers login
          router.push("/login");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la session:", error);
        setIsCheckingSession(false);
        router.push("/login");
      }
    };

    checkAuth();
  }, [cache, isLoading, router]);

  // Afficher un loader pendant la vérification
  if (isLoading || isCheckingSession) {
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
