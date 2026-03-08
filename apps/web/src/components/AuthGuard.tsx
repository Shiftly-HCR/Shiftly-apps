"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/profile/useCurrentUser";
import { useCurrentProfile } from "@/hooks/queries";
import { YStack, Text, Spinner } from "tamagui";
import { colors } from "@shiftly/ui";

/**
 * Routes publiques accessibles sans authentification
 */
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const PUBLIC_ROUTES = [
  "/",
  "/cgv",
  "/terms",
  "/legal",
  "/privacy",
  "/contact",
  "/faq",
  "/help",
];

/**
 * Composant de protection des routes
 * Vérifie l'authentification et redirige si nécessaire
 * Utilise useCurrentUser et useProfilePage pour s'assurer que les données sont chargées
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hasRedirected = useRef(false);
  const { user, isLoading: isLoadingUser } = useCurrentUser();
  const { isLoading: isLoadingProfile, isAuthResolved } = useCurrentProfile();

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || isAuthRoute;
  const isLoading = isLoadingUser || isLoadingProfile;
  // Attendre que l'authentification soit résolue avant de rediriger
  const isReady = isAuthResolved && !isLoading;

  useEffect(() => {
    // Réinitialiser hasRedirected quand le pathname change
    hasRedirected.current = false;
  }, [pathname]);

  useEffect(() => {
    // Ne pas rediriger si on n'est pas prêt ou si on a déjà redirigé
    if (!isReady || hasRedirected.current) {
      return;
    }

    // Si l'utilisateur n'est pas connecté
    if (!user) {
      // Si on n'est pas sur une route publique, rediriger vers login
      if (!isPublicRoute) {
        hasRedirected.current = true;
        router.replace("/login");
      }
      return;
    }

    // Si l'utilisateur est connecté et qu'on est sur une route d'auth, rediriger vers home
    if (isAuthRoute) {
      hasRedirected.current = true;
      router.replace("/home");
      return;
    }

    // Utilisateur connecté et route protégée : autoriser l'accès
  }, [user, isReady, isAuthRoute, isPublicRoute, pathname, router]);

  // Afficher un loader pendant le chargement ou tant que l'authentification n'est pas résolue
  if (!isReady) {
    return (
      <YStack
        flex={1}
        backgroundColor={colors.backgroundLight}
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Spinner size="large" color={colors.shiftlyViolet} />
        <Text fontSize={16} color="#6B7280" marginTop="$4">
          Chargement...
        </Text>
      </YStack>
    );
  }

  // Les routes publiques sont accessibles à tous (connecté ou non)
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Les routes protégées nécessitent un utilisateur connecté
  if (user && !isPublicRoute) {
    return <>{children}</>;
  }

  // Cas par défaut : afficher un loader pendant la redirection
  return (
    <YStack
      flex={1}
      backgroundColor={colors.backgroundLight}
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <Spinner size="large" color={colors.shiftlyViolet} />
      <Text fontSize={16} color="#6B7280" marginTop="$4">
        Redirection...
      </Text>
    </YStack>
  );
}
