"use client";

import { useState } from "react";
import { YStack, Paragraph, H2, ScrollView } from "tamagui";
import { Navbar } from "@hestia/ui";
import { signOut } from "../../../../../packages/data/auth/auth";
import { useRouter } from "next/navigation";

export default function NavbarDemoPage() {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const handleLogout = async () => {
    const result = await signOut();

    if (result.success) {
      // Redirection vers la page de connexion après déconnexion
      router.push("/login");
    } else {
      console.error("Erreur lors de la déconnexion:", result.error);
      alert("Erreur lors de la déconnexion. Veuillez réessayer.");
    }
  };

  return (
    <YStack flex={1} backgroundColor="#FAFAFA">
      <Navbar
        searchValue={searchValue}
        onSearch={setSearchValue}
        userName="Julien Belinga"
        onProfileClick={() => console.log("Profil cliqué")}
        onMissionsClick={() => router.push("/missions")}
        onSubscriptionClick={() => console.log("Abonnement cliqué")}
        onHelpClick={() => console.log("Aide cliqué")}
        onLogoutClick={handleLogout}
      />

      <ScrollView flex={1}>
        <YStack padding="$6" gap="$4" maxWidth={1200} alignSelf="center">
          <H2>Démonstration de la Navbar</H2>
          <Paragraph>
            Cette page démontre l'utilisation de la Navbar avec la fonction de
            déconnexion intégrée.
          </Paragraph>
          <Paragraph>
            • Le texte dans le cercle de profil est maintenant centré
          </Paragraph>
          <Paragraph>
            • Le bouton "Déconnexion" appelle la fonction signOut de auth.ts
          </Paragraph>
          <Paragraph>
            • Après une déconnexion réussie, l'utilisateur est redirigé vers la
            page de connexion
          </Paragraph>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
