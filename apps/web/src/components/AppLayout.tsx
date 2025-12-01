"use client";

import { YStack } from "tamagui";
import { Navbar, Footer } from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCurrentUser, useCurrentProfile } from "@/hooks";
import { useSessionContext } from "@/providers/SessionProvider";
import { signOut } from "@shiftly/data";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const { user, isLoading: isLoadingUser } = useCurrentUser();
  const { profile, isLoading: isLoadingProfile } = useCurrentProfile();
  const { clear } = useSessionContext();
  const isLoading = isLoadingUser || isLoadingProfile;

  // Rediriger vers login si pas d'utilisateur
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    try {
      // Déconnecter de Supabase
      const result = await signOut();

      if (result.success) {
        // Vider le cache
        await clear();
        router.push("/login");
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Vider le cache même en cas d'erreur
      await clear();
      router.push("/login");
    }
  };

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <YStack
        flex={1}
        backgroundColor="#F9FAFB"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        {/* Vous pouvez ajouter un composant de chargement ici */}
      </YStack>
    );
  }

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor="#F9FAFB">
      <Navbar
        searchValue={searchValue}
        onSearch={setSearchValue}
        userName={
          profile?.first_name ||
          user?.user_metadata?.first_name ||
          user?.email?.split("@")[0] ||
          "Utilisateur"
        }
        userAvatar={profile?.photo_url || ""}
        onHomeClick={() => router.push("/home")}
        onProfileClick={() => router.push("/profile")}
        onMissionsClick={() => router.push("/missions")}
        onSubscriptionClick={() => router.push("/subscription")}
        onFreelanceClick={() => router.push("/freelance")}
        onMessagingClick={() => router.push("/messagerie")}
        onLogoutClick={handleLogout}
      />
      <YStack flex={1}>{children}</YStack>
      <Footer
        onHomeClick={() => router.push("/home")}
        onMissionsClick={() => router.push("/missions")}
        onProfileClick={() => router.push("/profile")}
        onSubscriptionClick={() => router.push("/subscription")}
        onHelpClick={() => router.push("/help")}
        onContactClick={() => router.push("/contact")}
        onFaqClick={() => router.push("/faq")}
        onTermsClick={() => router.push("/terms")}
        onPrivacyClick={() => router.push("/privacy")}
        onLegalClick={() => router.push("/legal")}
      />
    </YStack>
  );
}
