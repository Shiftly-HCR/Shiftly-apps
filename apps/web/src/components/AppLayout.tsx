"use client";

import { YStack } from "tamagui";
import { Navbar, Footer } from "@hestia/ui";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCurrentUser, signOut, getCurrentProfile } from "@hestia/data";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [user, setUser] = useState<any>(null);
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        
        // Charger le profil pour obtenir la photo
        const profile = await getCurrentProfile();
        if (profile?.photo_url) {
          setUserAvatar(profile.photo_url);
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    const result = await signOut();

    if (result.success) {
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
          user?.user_metadata?.first_name ||
          user?.email?.split("@")[0] ||
          "Utilisateur"
        }
        userAvatar={userAvatar}
        onHomeClick={() => router.push("/home")}
        onProfileClick={() => router.push("/profile")}
        onMissionsClick={() => router.push("/missions")}
        onSubscriptionClick={() => router.push("/subscription")}
        onHelpClick={() => router.push("/help")}
        onLogoutClick={handleLogout}
      />
      <YStack flex={1}>
        {children}
      </YStack>
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

