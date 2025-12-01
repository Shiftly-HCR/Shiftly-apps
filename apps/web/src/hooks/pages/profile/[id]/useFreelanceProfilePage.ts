"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useCachedProfile,
  useCachedFreelanceData,
  useCurrentProfile,
} from "@/hooks";

type TabType = "overview" | "availability" | "reviews" | "documents";

/**
 * Hook pour gérer la logique de la page de profil freelance
 * Gère le chargement du profil, des expériences, des éducations et la gestion des onglets
 */
export function useFreelanceProfilePage() {
  const params = useParams();
  const freelanceId = params?.id as string;

  const { profile, isLoading: isLoadingProfile } = useCachedProfile(freelanceId);
  const {
    experiences,
    educations,
    isLoading: isLoadingExperiences,
  } = useCachedFreelanceData(freelanceId);
  const { profile: currentProfile } = useCurrentProfile();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const isLoading = isLoadingProfile || isLoadingExperiences;

  return {
    freelanceId,
    profile,
    experiences,
    educations,
    currentProfile,
    activeTab,
    setActiveTab,
    isLoading,
  };
}

