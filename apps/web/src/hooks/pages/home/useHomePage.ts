"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Mission } from "@shiftly/data";
import { useCachedMissions } from "@/hooks/cache/useCachedMissions";
import type { MissionFiltersState } from "@shiftly/ui";

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

export const dateRangeOptions = [
  { label: "Toutes les dates", value: "all" },
  { label: "Aujourd'hui", value: "today" },
  { label: "Cette semaine", value: "this_week" },
  { label: "Ce mois", value: "this_month" },
  { label: "Dans 3 mois", value: "next_3_months" },
];

/**
 * Hook pour gérer la logique de la page d'accueil (liste des missions)
 * Gère le chargement, le filtrage et la navigation
 */
export function useHomePage() {
  const router = useRouter();
  const { data: missions = [], isLoading, error } = useCachedMissions();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [filters, setFilters] = useState<MissionFiltersState>({});

  // Gérer les erreurs silencieusement (on peut afficher un message si nécessaire)
  if (error) {
    console.error("Erreur lors du chargement des missions:", error);
  }

  // Formater les dates pour l'affichage
  const formatDate = (startDate?: string, endDate?: string) => {
    if (!startDate && !endDate) return "Dates non définies";

    const formatOptions: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
    };

    if (startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString(
        "fr-FR",
        formatOptions
      );
      const end = new Date(endDate).toLocaleDateString("fr-FR", formatOptions);
      return `Du ${start} au ${end}`;
    }

    if (startDate) {
      const date = new Date(startDate).toLocaleDateString(
        "fr-FR",
        formatOptions
      );
      return `À partir du ${date}`;
    }

    return "Dates non définies";
  };

  // Déterminer si une mission est nouvelle (créée dans les dernières 48h)
  const isNewMission = (createdAt?: string) => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 48;
  };

  // Filtrer les missions selon les critères
  const filteredMissions = useMemo(() => {
    return missions.filter((mission) => {
      // Filtre par position (skills)
      if (filters.position && filters.position !== "all") {
        const skills = mission.skills?.join(" ").toLowerCase() || "";
        const title = mission.title?.toLowerCase() || "";
        if (
          !skills.includes(filters.position.toLowerCase()) &&
          !title.includes(filters.position.toLowerCase())
        ) {
          return false;
        }
      }

      // Filtre par localisation
      if (filters.location && filters.location !== "all") {
        const city = mission.city?.toLowerCase() || "";
        const address = mission.address?.toLowerCase() || "";
        if (
          !city.includes(filters.location.toLowerCase()) &&
          !address.includes(filters.location.toLowerCase())
        ) {
          return false;
        }
      }

      // Filtre par taux horaire
      if (filters.hourlyRateMin && mission.hourly_rate) {
        if (mission.hourly_rate < filters.hourlyRateMin) {
          return false;
        }
      }
      if (filters.hourlyRateMax && mission.hourly_rate) {
        if (mission.hourly_rate > filters.hourlyRateMax) {
          return false;
        }
      }

      // Filtre par plage de dates
      if (
        filters.dateRange &&
        filters.dateRange !== "all" &&
        mission.start_date
      ) {
        const missionDate = new Date(mission.start_date);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        switch (filters.dateRange) {
          case "today":
            const today = new Date(now);
            if (
              missionDate.getTime() < today.getTime() ||
              missionDate.getTime() > today.getTime() + 24 * 60 * 60 * 1000
            ) {
              return false;
            }
            break;
          case "this_week":
            const weekEnd = new Date(now);
            weekEnd.setDate(weekEnd.getDate() + 7);
            if (missionDate.getTime() > weekEnd.getTime()) {
              return false;
            }
            break;
          case "this_month":
            const monthEnd = new Date(now);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            if (missionDate.getTime() > monthEnd.getTime()) {
              return false;
            }
            break;
          case "next_3_months":
            const threeMonthsEnd = new Date(now);
            threeMonthsEnd.setMonth(threeMonthsEnd.getMonth() + 3);
            if (missionDate.getTime() > threeMonthsEnd.getTime()) {
              return false;
            }
            break;
        }
      }

      // Filtre par urgent
      if (filters.urgent && !mission.is_urgent) {
        return false;
      }

      return true;
    });
  }, [missions, filters]);

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
    if (filters.dateRange && filters.dateRange !== "all") {
      const dateLabel =
        dateRangeOptions.find((opt) => opt.value === filters.dateRange)
          ?.label || filters.dateRange;
      tags.push(dateLabel);
    }
    if (filters.hourlyRateMin || filters.hourlyRateMax) {
      const min = filters.hourlyRateMin || 15;
      const max = filters.hourlyRateMax || 100;
      tags.push(`${min}€ - ${max}€ / heure`);
    }
    if (filters.urgent) {
      tags.push("Urgent");
    }
    return tags;
  }, [filters]);

  const removeFilter = (tag: string) => {
    // Trouver quel filtre correspond au tag
    const positionMatch = positionOptions.find((opt) => opt.label === tag);
    const locationMatch = locationOptions.find((opt) => opt.label === tag);
    const dateMatch = dateRangeOptions.find((opt) => opt.label === tag);
    const rateMatch = tag.match(/(\d+)€ - (\d+)€ \/ heure/);
    const urgentMatch = tag === "Urgent";

    if (positionMatch) {
      setFilters({ ...filters, position: undefined });
    } else if (locationMatch) {
      setFilters({ ...filters, location: undefined });
    } else if (dateMatch) {
      setFilters({ ...filters, dateRange: undefined });
    } else if (rateMatch) {
      setFilters({
        ...filters,
        hourlyRateMin: undefined,
        hourlyRateMax: undefined,
      });
    } else if (urgentMatch) {
      setFilters({ ...filters, urgent: undefined });
    }
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  // Gérer le clic sur une mission
  const handleMissionClick = (missionId: string) => {
    router.push(`/missions/${missionId}`);
  };

  return {
    missions,
    isLoading,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    filteredMissions,
    activeFilterTags,
    removeFilter,
    clearAllFilters,
    formatDate,
    isNewMission,
    handleMissionClick,
  };
}

