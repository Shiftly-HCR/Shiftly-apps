"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/profile/useCurrentUser";
import { useProfilePage } from "@/hooks/pages/profile/useProfilePage";
import { useCurrentProfile } from "@/hooks/queries";
import { YStack, Text, Spinner } from "tamagui";
import { colors } from "@shiftly/ui";

/**
 * Routes publiques accessibles sans authentification
 */
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
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
  // useProfilePage utilise useCurrentProfile en interne, ce qui garantit que le profil est chargé
  const { isLoading: isLoadingProfile } = useProfilePage();
  // Utiliser useCurrentProfile directement pour avoir accès à isAuthResolved
  const { isAuthResolved } = useCurrentProfile();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
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

    // Si l'utilisateur est connecté et qu'on est sur une route publique, rediriger vers home
    if (isPublicRoute) {
      hasRedirected.current = true;
      router.replace("/home");
      return;
    }

    // Utilisateur connecté et route protégée : autoriser l'accès
  }, [user, isReady, isPublicRoute, pathname, router]);

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

  // Si l'utilisateur n'est pas connecté et qu'on est sur une route publique, afficher le contenu
  if (!user && isPublicRoute) {
    return <>{children}</>;
  }

  // Si l'utilisateur est connecté et qu'on n'est pas sur une route publique, afficher le contenu
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
