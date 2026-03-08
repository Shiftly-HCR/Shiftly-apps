"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { YStack } from "tamagui";
import { Navbar } from "@shiftly/ui";
import Header from "@/components/landing/Header";
import { useCurrentProfile, useCurrentUser, useSignOut } from "@/hooks/queries";

export function PublicTopNavigation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  const { data: user } = useCurrentUser();
  const { data: profile, isAuthResolved } = useCurrentProfile();
  const signOutMutation = useSignOut();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleSearchSubmit = (value: string) => {
    const trimmed = value.trim();
    const targetPath = profile?.role === "recruiter" ? "/freelance" : "/home";
    router.push(trimmed ? `${targetPath}?q=${encodeURIComponent(trimmed)}` : targetPath);
  };

  const handleLogout = async () => {
    try {
      await signOutMutation.mutateAsync();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch {
      queryClient.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  if (!isAuthResolved) {
    return <YStack height={64} width="100%" />;
  }

  if (!user) {
    return <Header />;
  }

  return (
    <Navbar
      searchValue={searchValue}
      onChangeText={setSearchValue}
      onSearch={handleSearchSubmit}
      userName={
        profile?.first_name ||
        user.user_metadata?.first_name ||
        user.email?.split("@")[0] ||
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
  );
}
