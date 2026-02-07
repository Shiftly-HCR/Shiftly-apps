"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { FreelanceProfile } from "@shiftly/data";
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
  { label: "Immédiatement", value: "immediate" },
  { label: "Cette semaine", value: "this_week" },
  { label: "Ce mois", value: "this_month" },
  { label: "Flexible", value: "flexible" },
];

export const badgeOptions = [
  { label: "Certifié", value: "certified" },
  { label: "Shiftly+", value: "shiftly_plus" },
];


/**
 * Hook pour gérer la logique de la page de liste des freelances
 * Gère le chargement, le filtrage et la navigation
 */
export function useFreelancePage() {
  const router = useRouter();
  const { searchQuery } = useSearchQuery();
  const { data: freelances = [], isLoading, error } = usePublishedFreelances();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<FreelanceFiltersState>({});

  // Gérer les erreurs silencieusement (on peut afficher un message si nécessaire)
  if (error) {
    console.error("Erreur lors du chargement des freelances:", error);
  }

  // Filtrer les freelances selon les critères (filtres + recherche texte ?q=)
  const filteredFreelances = useMemo(() => {
    return freelances.filter((freelance) => {
      // Search query: each token must match at least one of first_name, last_name, headline, bio, summary, location, skills
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const tokens = query.split(/\s+/).filter(Boolean);
        const searchable =
          [
            freelance.first_name,
            freelance.last_name,
            freelance.headline,
            freelance.bio,
            freelance.summary,
            freelance.location,
            freelance.skills?.join(" "),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
        const allTokensMatch = tokens.every((token) => searchable.includes(token));
        if (!allTokensMatch) return false;
      }

      // Filtre par position (headline ou skills)
      if (filters.position && filters.position !== "all") {
        const headline = freelance.headline?.toLowerCase() || "";
        const skills = freelance.skills?.join(" ").toLowerCase() || "";
        if (
          !headline.includes(filters.position.toLowerCase()) &&
          !skills.includes(filters.position.toLowerCase())
        ) {
          return false;
        }
      }

      // Filtre par localisation
      if (filters.location && filters.location !== "all") {
        const location = freelance.location?.toLowerCase() || "";
        if (!location.includes(filters.location.toLowerCase())) {
          return false;
        }
      }

      // Filtre par note
      if (filters.rating && freelance.note) {
        if (freelance.note < filters.rating) {
          return false;
        }
      }

      // Filtre par TJM (taux journalier)
      if (filters.dailyRateMin != null && freelance.daily_rate != null) {
        if (freelance.daily_rate < filters.dailyRateMin) return false;
      }
      if (filters.dailyRateMax != null && freelance.daily_rate != null) {
        if (freelance.daily_rate > filters.dailyRateMax) return false;
      }

      // Filtre par disponibilité
      if (filters.availability && filters.availability !== "all") {
        const avail = freelance.availability?.toLowerCase() || "";
        const filterAvail = filters.availability.toLowerCase();
        if (!avail.includes(filterAvail) && avail !== filterAvail) {
          return false;
        }
      }

      // Filtre par badge
      if (filters.badge && filters.badge !== "all") {
        const badges = freelance.badges;
        if (!badges) return false;
        const badgeList = Array.isArray(badges) ? badges : [badges];
        const hasBadge = badgeList.some(
          (b) => b?.toLowerCase() === filters.badge?.toLowerCase()
        );
        if (!hasBadge) return false;
      }

      return true;
    });
  }, [freelances, filters, searchQuery]);

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
    if (filters.rating) {
      tags.push(`${filters.rating} ★ et +`);
    }
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
    const ratingMatch = tag.match(/(\d+) ★ et \+/);
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
    } else if (ratingMatch) {
      setFilters({ ...filters, rating: undefined });
    } else if (badgeMatch) {
      setFilters({ ...filters, badge: undefined });
    }
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  // Obtenir le nom complet d'un freelance
  const getFullName = (freelance: FreelanceProfile) => {
    const firstName = freelance.first_name || "";
    const lastName = freelance.last_name || "";
    return `${firstName} ${lastName}`.trim() || "Freelance";
  };

  // Obtenir les compétences/tags d'un freelance
  const getTags = (freelance: FreelanceProfile): string[] => {
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

