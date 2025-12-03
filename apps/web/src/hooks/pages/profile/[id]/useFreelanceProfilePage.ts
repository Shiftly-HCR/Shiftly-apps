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

  const { 
    data: profile, 
    isLoading: isLoadingProfile,
    isFetching: isFetchingProfile,
    error: profileError 
  } = useCachedProfile(freelanceId);
  const {
    experiences,
    educations,
    isLoading: isLoadingExperiences,
  } = useCachedFreelanceData(freelanceId);
  const { profile: currentProfile } = useCurrentProfile();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // isLoading est true si on charge pour la première fois
  // isFetching est true si on recharge (même avec placeholderData)
  const isLoading = isLoadingProfile || isLoadingExperiences;
  const isFetching = isFetchingProfile;

  return {
    freelanceId,
    profile: profile || null, // S'assurer que profile n'est jamais undefined
    experiences,
    educations,
    currentProfile,
    activeTab,
    setActiveTab,
    isLoading,
    isFetching,
    profileError,
  };
}

