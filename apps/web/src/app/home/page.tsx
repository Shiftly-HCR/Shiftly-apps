"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import {
  Badge,
  Button,
  MissionCard,
  MissionFilters,
  type MissionFiltersState,
  colors,
} from "@shiftly/ui";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FiMap, FiList } from "react-icons/fi";
import { AppLayout } from "../../components/AppLayout";
import { getPublishedMissions, type Mission } from "@shiftly/data";
import { useSessionContext } from "../../providers/SessionProvider";
import dynamic from "next/dynamic";

// Import dynamique de Map pour éviter les erreurs SSR
const Map = dynamic(() => import("../../components/Map"), {
  ssr: false,
  loading: () => (
    <YStack
      backgroundColor={colors.gray100}
      borderRadius={12}
      height={600}
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize={14} color={colors.gray500}>
        Chargement de la carte...
      </Text>
    </YStack>
  ),
});

const positionOptions = [
  { label: "Tous les postes", value: "all" },
  { label: "Serveur", value: "serveur" },
  { label: "Barman", value: "barman" },
  { label: "Chef de cuisine", value: "chef" },
  { label: "Commis de cuisine", value: "commis" },
  { label: "Réceptionniste", value: "receptionniste" },
  { label: "Manager", value: "manager" },
];

const locationOptions = [
  { label: "Partout", value: "all" },
  { label: "Paris", value: "paris" },
  { label: "Lyon", value: "lyon" },
  { label: "Marseille", value: "marseille" },
  { label: "Toulouse", value: "toulouse" },
  { label: "Nice", value: "nice" },
  { label: "Bordeaux", value: "bordeaux" },
];

const dateRangeOptions = [
  { label: "Toutes les dates", value: "all" },
  { label: "Aujourd'hui", value: "today" },
  { label: "Cette semaine", value: "this_week" },
  { label: "Ce mois", value: "this_month" },
  { label: "Dans 3 mois", value: "next_3_months" },
];

export default function HomePage() {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [filters, setFilters] = useState<MissionFiltersState>({});

  // Charger les missions publiées depuis Supabase
  const { cacheMissions, cache } = useSessionContext();

  useEffect(() => {
    const loadMissions = async () => {
      setIsLoading(true);
      try {
        // Toujours charger depuis Supabase car la liste peut changer
        // (nouvelles missions, missions mises à jour, etc.)
        const publishedMissions = await getPublishedMissions();
        setMissions(publishedMissions);

        // Mettre toutes les missions en cache pour les prochaines navigations
        if (publishedMissions.length > 0) {
          cacheMissions(publishedMissions);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des missions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMissions();
  }, [cacheMissions]);

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

  if (isLoading) {
    return (
      <AppLayout>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$6"
        >
          <Text fontSize={16} color={colors.gray700}>
            Chargement des missions...
          </Text>
        </YStack>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Contenu principal */}
      <ScrollView flex={1}>
        <YStack maxWidth={1400} width="100%" alignSelf="center" padding="$6">
          {/* Filtres actifs et vue */}
          {activeFilterTags.length > 0 && (
            <XStack
              paddingVertical="$4"
              gap="$3"
              flexWrap="wrap"
              alignItems="center"
            >
              <Text fontSize={14} color={colors.gray700} fontWeight="600">
                Filtres actifs:
              </Text>

              {activeFilterTags.map((tag) => (
                <XStack
                  key={tag}
                  paddingHorizontal="$3"
                  paddingVertical="$1.5"
                  backgroundColor={colors.white}
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor={colors.gray200}
                  gap="$2"
                  alignItems="center"
                >
                  <Text fontSize={13} color={colors.gray900} fontWeight="500">
                    {tag}
                  </Text>
                  <Text
                    fontSize={16}
                    color={colors.gray700}
                    cursor="pointer"
                    hoverStyle={{ color: "#EF4444" }}
                    onPress={() => removeFilter(tag)}
                  >
                    ✕
                  </Text>
                </XStack>
              ))}

              <Text
                fontSize={13}
                color={colors.shiftlyViolet}
                fontWeight="600"
                cursor="pointer"
                textDecorationLine="underline"
                hoverStyle={{ opacity: 0.8 }}
                onPress={clearAllFilters}
              >
                Effacer tout
              </Text>

              {/* Toggle Liste/Carte */}
              <XStack marginLeft="auto" gap="$2">
                <XStack
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  backgroundColor={
                    viewMode === "list" ? colors.shiftlyViolet : colors.white
                  }
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor={
                    viewMode === "list" ? colors.shiftlyViolet : colors.gray200
                  }
                  gap="$2"
                  alignItems="center"
                  cursor="pointer"
                  hoverStyle={{
                    borderColor: colors.shiftlyViolet,
                    backgroundColor:
                      viewMode === "list"
                        ? colors.shiftlyViolet
                        : colors.shiftlyVioletLight,
                  }}
                  onPress={() => setViewMode("list")}
                >
                  <FiList
                    size={16}
                    color={viewMode === "list" ? "#fff" : colors.gray900}
                  />
                  <Text
                    fontSize={13}
                    color={viewMode === "list" ? "#fff" : colors.gray900}
                    fontWeight="600"
                  >
                    Liste
                  </Text>
                </XStack>

                <XStack
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  backgroundColor={
                    viewMode === "map" ? colors.shiftlyViolet : colors.white
                  }
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor={
                    viewMode === "map" ? colors.shiftlyViolet : colors.gray200
                  }
                  gap="$2"
                  alignItems="center"
                  cursor="pointer"
                  hoverStyle={{
                    borderColor: colors.shiftlyViolet,
                    backgroundColor:
                      viewMode === "map"
                        ? colors.shiftlyViolet
                        : colors.shiftlyVioletLight,
                  }}
                  onPress={() => setViewMode("map")}
                >
                  <FiMap
                    size={16}
                    color={viewMode === "map" ? "#fff" : colors.shiftlyViolet}
                  />
                  <Text
                    fontSize={13}
                    color={viewMode === "map" ? "#fff" : colors.gray900}
                    fontWeight="600"
                  >
                    Carte
                  </Text>
                </XStack>
              </XStack>
            </XStack>
          )}

          {/* Contenu principal avec filtres */}
          <XStack gap="$6" alignItems="flex-start" marginTop="$4">
            {/* Sidebar des filtres */}
            <YStack flexShrink={0}>
              <MissionFilters filters={filters} onFiltersChange={setFilters} />
            </YStack>

            {/* Grille de missions OU Carte */}
            <YStack flex={1} gap="$4">
              {filteredMissions.length === 0 ? (
                <YStack
                  padding="$8"
                  alignItems="center"
                  justifyContent="center"
                  gap="$4"
                >
                  <Text fontSize={18} color={colors.gray700} textAlign="center">
                    Aucune mission disponible pour le moment
                  </Text>
                  <Text fontSize={14} color={colors.gray500} textAlign="center">
                    Revenez plus tard pour découvrir de nouvelles opportunités
                  </Text>
                </YStack>
              ) : viewMode === "list" ? (
                <XStack flexWrap="wrap" gap="$4" justifyContent="flex-start">
                  {filteredMissions.map((mission) => (
                    <YStack
                      key={mission.id}
                      width="calc(33.333% - 12px)"
                      minWidth={300}
                      position="relative"
                      cursor="pointer"
                      onPress={() => router.push(`/missions/${mission.id}`)}
                    >
                      {isNewMission(mission.created_at) && (
                        <YStack
                          position="absolute"
                          top={12}
                          left={12}
                          zIndex={10}
                        >
                          <Badge variant="new" size="sm">
                            Nouveau
                          </Badge>
                        </YStack>
                      )}
                      <MissionCard
                        title={mission.title}
                        date={formatDate(mission.start_date, mission.end_date)}
                        price={
                          mission.hourly_rate
                            ? `${mission.hourly_rate}€`
                            : "À négocier"
                        }
                        priceUnit="/ heure"
                        image={mission.image_url}
                      />
                    </YStack>
                  ))}
                </XStack>
              ) : (
                <Map
                  latitude={48.8566}
                  longitude={2.3522}
                  zoom={11}
                  height={600}
                  markers={filteredMissions
                    .filter((m) => m.latitude && m.longitude)
                    .map((mission) => ({
                      id: mission.id,
                      latitude: mission.latitude!,
                      longitude: mission.longitude!,
                      title: mission.title,
                      onClick: () => router.push(`/missions/${mission.id}`),
                    }))}
                  interactive={true}
                />
              )}
            </YStack>
          </XStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
