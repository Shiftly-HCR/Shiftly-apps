"use client";

import { YStack } from "tamagui";
import { Navbar, Footer } from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { useAppLayout } from "@/hooks";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const {
    user,
    profile,
    isLoading,
    searchValue,
    setSearchValue,
    handleLogout,
  } = useAppLayout();

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
