"use client";

import { YStack, XStack, Text } from "tamagui";
import { Navbar, Footer, colors } from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { useAppLayout } from "@/hooks";
import { useFreelanceCompletionStatus } from "@/hooks/queries";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const {
    user,
    profile,
    isLoading,
    unreadMessagesCount,
    searchValue,
    setSearchValue,
    handleSearchSubmit,
    handleLogout,
  } = useAppLayout();
  const { data: completionStatus } = useFreelanceCompletionStatus(
    profile?.role === "freelance" ? profile.id || null : null
  );

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

  const completionMissingItems: string[] = [];
  if (profile?.role === "freelance") {
    if (!profile.photo_url?.trim()) {
      completionMissingItems.push("Ajouter une photo de profil");
    }
    if (!profile.bio?.trim() && !profile.summary?.trim()) {
      completionMissingItems.push("Ajouter une bio/description");
    }
    if ((completionStatus?.experience_count || 0) === 0) {
      completionMissingItems.push("Ajouter au moins une expérience");
    }
    if ((completionStatus?.education_count || 0) === 0) {
      completionMissingItems.push("Ajouter au moins une formation");
    }
    if (!profile.city_of_residence?.trim()) {
      completionMissingItems.push("Ajouter votre ville de résidence");
    }
  }

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
        messagingUnreadCount={unreadMessagesCount}
        onCommercialClick={() => handleNavigation("/commercial")}
        onPaymentsClick={() => handleNavigation("/payments")}
        onAdminDisputesClick={() => handleNavigation("/admin/disputes")}
        onAdminDashboardClick={() => handleNavigation("/admin/dashboard")}
        onLogoutClick={handleLogout}
      />
      {profile?.role === "freelance" && completionMissingItems.length > 0 && (
        <YStack paddingHorizontal="$4" paddingTop="$3">
          <YStack
            backgroundColor={colors.shiftlyViolet + "12"}
            borderWidth={1}
            borderColor={colors.shiftlyViolet + "35"}
            borderRadius="$4"
            padding="$4"
            gap="$2"
            cursor="pointer"
            hoverStyle={{ borderColor: colors.shiftlyViolet }}
            onPress={() => handleNavigation("/profile")}
          >
            <Text fontSize={15} fontWeight="700" color={colors.shiftlyViolet}>
              Augmentez vos chances de trouver une mission
            </Text>
            <Text fontSize={13} color="#4B5563">
              Complétez votre profil pour être mieux mis en avant.
            </Text>
            {completionMissingItems.map((item) => (
              <XStack key={item} gap="$2" alignItems="center">
                <Text fontSize={13} color={colors.shiftlyViolet}>
                  •
                </Text>
                <Text fontSize={13} color="#374151">
                  {item}
                </Text>
              </XStack>
            ))}
          </YStack>
        </YStack>
      )}
      <YStack flex={1} minHeight={0} overflow="hidden">
        {children}
      </YStack>
      <Footer
        onHomeClick={() => handleNavigation("/home")}
        onMissionsClick={() => handleNavigation("/missions")}
        onProfileClick={() => handleNavigation("/profile")}
        onSubscriptionClick={() => handleNavigation("/subscription")}
        onHelpClick={() => handleNavigation("/help")}
        onContactClick={() => handleNavigation("/contact")}
        onFaqClick={() => handleNavigation("/faq")}
        onCgvClick={() => handleNavigation("/cgv")}
        onTermsClick={() => handleNavigation("/terms")}
        onPrivacyClick={() => handleNavigation("/privacy")}
        onLegalClick={() => handleNavigation("/legal")}
      />
    </YStack>
  );
}
