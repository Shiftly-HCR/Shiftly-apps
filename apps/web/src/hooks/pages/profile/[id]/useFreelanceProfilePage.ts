"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useProfile,
  useFreelanceData,
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

  // Charger le profil via React Query
  const { 
    data: profile, 
    isLoading: isLoadingProfile,
    isFetching: isFetchingProfile,
    error: profileError 
  } = useProfile(freelanceId);

  // Charger les données freelance (expériences, éducations)
  const {
    data: freelanceData,
    isLoading: isLoadingFreelanceData,
  } = useFreelanceData(freelanceId);

  // Profil de l'utilisateur actuel
  const { data: currentProfile } = useCurrentProfile();
  
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // isLoading est true si on charge pour la première fois
  // isFetching est true si on recharge (même avec placeholderData)
  const isLoading = isLoadingProfile || isLoadingFreelanceData;
  const isFetching = isFetchingProfile;

  return {
    freelanceId,
    profile: profile || null,
    experiences: freelanceData?.experiences || [],
    educations: freelanceData?.educations || [],
    currentProfile: currentProfile || null,
    activeTab,
    setActiveTab,
    isLoading,
    isFetching,
    profileError,
  };
}

