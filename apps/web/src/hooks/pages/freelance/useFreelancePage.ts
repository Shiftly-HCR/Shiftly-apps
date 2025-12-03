"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { FreelanceProfile } from "@shiftly/data";
import { useCachedFreelances } from "@/hooks/cache/useCachedFreelances";
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


/**
 * Hook pour gérer la logique de la page de liste des freelances
 * Gère le chargement, le filtrage et la navigation
 */
export function useFreelancePage() {
  const router = useRouter();
  const { data: freelances = [], isLoading, error } = useCachedFreelances();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<FreelanceFiltersState>({});

  // Gérer les erreurs silencieusement (on peut afficher un message si nécessaire)
  if (error) {
    console.error("Erreur lors du chargement des freelances:", error);
  }

  // Filtrer les freelances selon les critères
  const filteredFreelances = useMemo(() => {
    return freelances.filter((freelance) => {
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

      // Filtre par badge (string dans le type UI)
      if (filters.badge && filters.badge !== "all") {
        if (!freelance.skills || freelance.skills.length === 0) {
          return false;
        }
      }

      return true;
    });
  }, [freelances, filters]);

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
    if (filters.rating) {
      tags.push(`${filters.rating} ★ et +`);
    }
    return tags;
  }, [filters]);

  const removeFilter = (tag: string) => {
    // Trouver quel filtre correspond au tag
    const positionMatch = positionOptions.find((opt) => opt.label === tag);
    const locationMatch = locationOptions.find((opt) => opt.label === tag);
    const ratingMatch = tag.match(/(\d+) ★ et \+/);

    if (positionMatch) {
      setFilters({ ...filters, position: undefined });
    } else if (locationMatch) {
      setFilters({ ...filters, location: undefined });
    } else if (ratingMatch) {
      setFilters({ ...filters, rating: undefined });
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

