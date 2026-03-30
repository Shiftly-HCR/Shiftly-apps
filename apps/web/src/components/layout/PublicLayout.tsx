"use client";

import { YStack } from "tamagui";
import { useRouter } from "next/navigation";
import { Footer } from "@shiftly/ui";
import { PublicTopNavigation } from "./PublicTopNavigation";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor="#F9FAFB">
      <PublicTopNavigation />
      <YStack flex={1}>{children}</YStack>
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
