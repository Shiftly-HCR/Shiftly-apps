"use client";

import { YStack, Text } from "tamagui";
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
    handleSearchSubmit,
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
        <Text fontSize={16} color="#6B7280">
          Chargement de votre session...
        </Text>
      </YStack>
    );
  }

  const handleNavigation = (path: string) => {
    // Si on est sur la page profile et qu'on navigue ailleurs, forcer un rechargement
    // pour éviter les problèmes de navigation bloquée
    if (typeof window !== "undefined" && window.location.pathname === "/profile" && path !== "/profile") {
      window.location.href = path;
    } else {
      router.push(path);
    }
  };

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor="#F9FAFB">
      <Navbar
        searchValue={searchValue}
        onChangeText={setSearchValue}
        onSearch={handleSearchSubmit}
        userName={
          profile?.first_name ||
          user?.user_metadata?.first_name ||
          user?.email?.split("@")[0] ||
          "Utilisateur"
        }
        userAvatar={profile?.photo_url || ""}
        userRole={profile?.role}
        onHomeClick={() => handleNavigation("/home")}
        onProfileClick={() => handleNavigation("/profile")}
        onMissionsClick={() => handleNavigation("/missions")}
        onSubscriptionClick={() => handleNavigation("/subscription")}
        onFreelanceClick={() => handleNavigation("/freelance")}
        onMessagingClick={() => handleNavigation("/messagerie")}
        onCommercialClick={() => handleNavigation("/commercial")}
        onPaymentsClick={() => handleNavigation("/payments")}
        onAdminDisputesClick={() => handleNavigation("/admin/disputes")}
        onAdminDashboardClick={() => handleNavigation("/admin/dashboard")}
        onLogoutClick={handleLogout}
      />
      <YStack flex={1}>{children}</YStack>
      <Footer
        onHomeClick={() => handleNavigation("/home")}
        onMissionsClick={() => handleNavigation("/missions")}
        onProfileClick={() => handleNavigation("/profile")}
        onSubscriptionClick={() => handleNavigation("/subscription")}
        onHelpClick={() => handleNavigation("/help")}
        onContactClick={() => handleNavigation("/contact")}
        onFaqClick={() => handleNavigation("/faq")}
        onTermsClick={() => handleNavigation("/terms")}
        onPrivacyClick={() => handleNavigation("/privacy")}
        onLegalClick={() => handleNavigation("/legal")}
      />
    </YStack>
  );
}
