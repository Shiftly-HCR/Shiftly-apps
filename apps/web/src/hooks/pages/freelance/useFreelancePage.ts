"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { PublishedFreelance } from "@shiftly/data";
import { usePublishedFreelances } from "@/hooks/queries";
import { useSearchQuery } from "@/hooks/search";
import type { FreelanceFiltersState } from "@shiftly/ui";

export const positionOptions = [
  { label: "Tous les postes", value: "all" },
  { label: "Serveur", value: "serveur" },
  { label: "Barman", value: "barman" },
  { label: "Chef de cuisine", value: "chef" },
  { label: "Commis de cuisine", value: "commis" },
  { label: "Réceptionniste", value: "receptionniste" },
  { label: "Manager", value: "manager" },
];

export const locationOptions = [
  { label: "Partout", value: "all" },
  { label: "Paris", value: "paris" },
  { label: "Lyon", value: "lyon" },
  { label: "Marseille", value: "marseille" },
  { label: "Toulouse", value: "toulouse" },
  { label: "Nice", value: "nice" },
  { label: "Bordeaux", value: "bordeaux" },
];

export const availabilityOptions = [
  { label: "Toutes", value: "all" },
  { label: "Immédiatement", value: "immediate" },
  { label: "Cette semaine", value: "this_week" },
  { label: "Ce mois", value: "this_month" },
  { label: "Flexible", value: "flexible" },
];

export const badgeOptions = [
  { label: "Certifié", value: "certified" },
  { label: "Shiftly+", value: "shiftly_plus" },
];

function isFilled(value?: string | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

function getProfileCompletenessScore(freelance: PublishedFreelance): number {
  const hasPhoto = isFilled(freelance.photo_url);
  const hasBioDescription = isFilled(freelance.bio) || isFilled(freelance.summary);
  const experienceCount = freelance.experience_count || 0;
  const educationCount = freelance.education_count || 0;
  const hasExperience = experienceCount > 0;
  const hasEducation = educationCount > 0;

  // 4 critères principaux demandés: photo, bio/description, expérience, formation
  let score = 0;
  if (hasPhoto) score += 1;
  if (hasBioDescription) score += 1;
  if (hasExperience) score += 1;
  if (hasEducation) score += 1;

  // Bonus léger pour départager les profils à critères égaux
  score += Math.min(experienceCount, 10) * 0.01;
  score += Math.min(educationCount, 10) * 0.01;

  return score;
}


/**
 * Hook pour gérer la logique de la page de liste des freelances
 * Gère le chargement, le filtrage et la navigation
 */
export function useFreelancePage() {
  const ITEMS_PER_PAGE = 50;
  const router = useRouter();
  const { searchQuery } = useSearchQuery();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<FreelanceFiltersState>({});
  const normalizedQuery = searchQuery.trim();

  const searchParams = useMemo(
    () => ({
      query: normalizedQuery || undefined,
      position: filters.position,
      location: filters.location,
      availability: filters.availability,
      badge: filters.badge,
      dailyRateMin: filters.dailyRateMin,
      dailyRateMax: filters.dailyRateMax,
      page: currentPage,
      pageSize: ITEMS_PER_PAGE,
    }),
    [currentPage, filters, normalizedQuery]
  );

  const { data, isLoading, error } = usePublishedFreelances(searchParams);
  const freelances = data?.items || [];
  const totalFreelances = data?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalFreelances / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [
    normalizedQuery,
    filters.position,
    filters.location,
    filters.availability,
    filters.badge,
    filters.dailyRateMin,
    filters.dailyRateMax,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Gérer les erreurs silencieusement (on peut afficher un message si nécessaire)
  if (error) {
    console.error("Erreur lors du chargement des freelances:", error);
  }

  const filteredFreelances = useMemo(() => {
    return [...freelances].sort((a, b) => {
      const scoreDiff =
        getProfileCompletenessScore(b) - getProfileCompletenessScore(a);
      if (scoreDiff !== 0) return scoreDiff;

      const bUpdatedAt = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      const aUpdatedAt = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      return bUpdatedAt - aUpdatedAt;
    });
  }, [freelances]);

  // Générer les tags de filtres actifs pour l'affichage
  const activeFilterTags = useMemo(() => {
    const tags: string[] = [];
    if (filters.position && filters.position !== "all") {
      const positionLabel =
        positionOptions.find((opt) => opt.value === filters.position)?.label ||
        filters.position;
      tags.push(positionLabel);
    }
    if (filters.location && filters.location !== "all") {
      const locationLabel =
        locationOptions.find((opt) => opt.value === filters.location)?.label ||
        filters.location;
      tags.push(locationLabel);
    }
    if (filters.dailyRateMin != null || filters.dailyRateMax != null) {
      const min = filters.dailyRateMin ?? 80;
      const max = filters.dailyRateMax ?? 400;
      tags.push(`${min}€ - ${max}€ / jour`);
    }
    if (filters.availability && filters.availability !== "all") {
      const availLabel =
        availabilityOptions.find((opt) => opt.value === filters.availability)
          ?.label || filters.availability;
      tags.push(availLabel);
    }
    // TODO: Feature not ready yet
    // if (filters.rating) {
    //   tags.push(`${filters.rating} ★ et +`);
    // }
    if (filters.badge && filters.badge !== "all") {
      const badgeLabel =
        badgeOptions.find((opt) => opt.value === filters.badge)?.label ||
        filters.badge;
      tags.push(badgeLabel);
    }
    return tags;
  }, [filters]);

  const removeFilter = (tag: string) => {
    const positionMatch = positionOptions.find((opt) => opt.label === tag);
    const locationMatch = locationOptions.find((opt) => opt.label === tag);
    const rateMatch = tag.match(/(\d+)€ - (\d+)€ \/ jour/);
    const availabilityMatch = availabilityOptions.find((opt) => opt.label === tag);
    // TODO: Feature not ready yet
    // const ratingMatch = tag.match(/(\d+) ★ et \+/);
    const badgeMatch = badgeOptions.find((opt) => opt.label === tag);

    if (positionMatch) {
      setFilters({ ...filters, position: undefined });
    } else if (locationMatch) {
      setFilters({ ...filters, location: undefined });
    } else if (rateMatch) {
      setFilters({
        ...filters,
        dailyRateMin: undefined,
        dailyRateMax: undefined,
      });
    } else if (availabilityMatch) {
      setFilters({ ...filters, availability: undefined });
    }
    // TODO: Feature not ready yet
    // else if (ratingMatch) {
    //   setFilters({ ...filters, rating: undefined });
    // }
    else if (badgeMatch) {
      setFilters({ ...filters, badge: undefined });
    }
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  // Obtenir le nom complet d'un freelance
  const getFullName = (freelance: PublishedFreelance) => {
    const firstName = freelance.first_name || "";
    const lastName = freelance.last_name || "";
    return `${firstName} ${lastName}`.trim() || "Freelance";
  };

  // Obtenir les compétences/tags d'un freelance
  const getTags = (freelance: PublishedFreelance): string[] => {
    if (freelance.skills && Array.isArray(freelance.skills)) {
      return freelance.skills.slice(0, 3);
    }
    return [];
  };

  // Gérer le clic sur "Voir le profil"
  const handleViewProfile = (freelanceId: string) => {
    router.push(`/profile/${freelanceId}`);
  };

  // Gérer le contact direct
  const handleInvite = (freelanceId: string) => {
    router.push(`/profile/${freelanceId}?contact=true`);
  };

  return {
    freelances,
    isLoading,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    totalPages,
    totalFreelances,
    itemsPerPage: ITEMS_PER_PAGE,
    filters,
    setFilters,
    filteredFreelances,
    activeFilterTags,
    removeFilter,
    clearAllFilters,
    getFullName,
    getTags,
    handleViewProfile,
    handleInvite,
  };
}
