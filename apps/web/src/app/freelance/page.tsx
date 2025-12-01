"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import {
  Badge,
  FreelanceCard,
  Button,
  FreelanceFilters,
  type FreelanceFiltersState,
  colors,
} from "@shiftly/ui";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FiGrid, FiList } from "react-icons/fi";
import { AppLayout } from "@/components/AppLayout";
import { getPublishedFreelances, type FreelanceProfile } from "@shiftly/data";
import { useSessionContext } from "@/providers/SessionProvider";

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

export default function FreelancePage() {
  const router = useRouter();
  const { cacheProfiles, cache } = useSessionContext();
  const [freelances, setFreelances] = useState<FreelanceProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<FreelanceFiltersState>({});

  // Charger les freelances depuis Supabase (et les mettre en cache)
  useEffect(() => {
    const loadFreelances = async () => {
      setIsLoading(true);
      try {
        // Toujours charger depuis Supabase car la liste peut changer
        // (nouvelles inscriptions, profils mis à jour, etc.)
        const publishedFreelances = await getPublishedFreelances();
        setFreelances(publishedFreelances);

        // Mettre tous les profils en cache pour les prochaines navigations
        if (publishedFreelances.length > 0) {
          cacheProfiles(publishedFreelances);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des freelances:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFreelances();
  }, [cacheProfiles]);

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

      // Filtre par badge (pour l'instant, on vérifie juste si le freelance a des compétences)
      if (filters.badge) {
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
            Chargement des freelances...
          </Text>
        </YStack>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ScrollView flex={1}>
        <YStack maxWidth={1400} width="100%" alignSelf="center" padding="$6">
          {/* En-tête */}
          <YStack marginBottom="$6">
            <Text
              fontSize={32}
              fontWeight="700"
              color={colors.gray900}
              marginBottom="$2"
            >
              Découvrez nos freelances
            </Text>
            <Text fontSize={16} color={colors.gray600}>
              Trouvez le talent parfait pour votre mission parmi nos freelances
              qualifiés
            </Text>
          </YStack>

          {/* Filtres actifs et vue */}
          {activeFilterTags.length > 0 && (
            <XStack
              paddingVertical="$4"
              gap="$3"
              flexWrap="wrap"
              alignItems="center"
              marginBottom="$4"
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

              {/* Toggle Grille/Liste */}
              <XStack marginLeft="auto" gap="$2">
                <XStack
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  backgroundColor={
                    viewMode === "grid" ? colors.shiftlyViolet : colors.white
                  }
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor={
                    viewMode === "grid" ? colors.shiftlyViolet : colors.gray200
                  }
                  gap="$2"
                  alignItems="center"
                  cursor="pointer"
                  hoverStyle={{
                    borderColor: colors.shiftlyViolet,
                    backgroundColor:
                      viewMode === "grid"
                        ? colors.shiftlyViolet
                        : colors.shiftlyVioletLight,
                  }}
                  onPress={() => setViewMode("grid")}
                >
                  <FiGrid
                    size={16}
                    color={viewMode === "grid" ? "#fff" : colors.gray900}
                  />
                </XStack>

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
                </XStack>
              </XStack>
            </XStack>
          )}

          {/* Contenu principal avec filtres */}
          <XStack gap="$6" alignItems="flex-start">
            {/* Sidebar des filtres */}
            <YStack flexShrink={0}>
              <FreelanceFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
            </YStack>

            {/* Grille de freelances */}
            <YStack flex={1} gap="$4">
              {filteredFreelances.length === 0 ? (
                <YStack
                  padding="$8"
                  alignItems="center"
                  justifyContent="center"
                  gap="$4"
                >
                  <Text fontSize={18} color={colors.gray700} textAlign="center">
                    Aucun freelance disponible pour le moment
                  </Text>
                  <Text fontSize={14} color={colors.gray500} textAlign="center">
                    Revenez plus tard pour découvrir de nouveaux talents
                  </Text>
                </YStack>
              ) : (
                <XStack flexWrap="wrap" gap="$4" justifyContent="flex-start">
                  {filteredFreelances.map((freelance) => (
                    <YStack
                      key={freelance.id}
                      width={
                        viewMode === "grid" ? "calc(33.333% - 12px)" : "100%"
                      }
                      minWidth={viewMode === "grid" ? 280 : undefined}
                      position="relative"
                    >
                      <YStack
                        backgroundColor={colors.white}
                        borderRadius={12}
                        padding="$4"
                        gap="$3"
                        borderWidth={1}
                        borderColor={colors.gray200}
                        cursor="pointer"
                        hoverStyle={{
                          borderColor: colors.shiftlyViolet,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 8,
                        }}
                        onPress={() => handleViewProfile(freelance.id)}
                      >
                        {/* Avatar et infos principales */}
                        <XStack gap="$3" alignItems="center">
                          <YStack position="relative">
                            <YStack
                              width={60}
                              height={60}
                              borderRadius={30}
                              backgroundColor={colors.shiftlyViolet}
                              alignItems="center"
                              justifyContent="center"
                              overflow="hidden"
                            >
                              {freelance.photo_url ? (
                                <img
                                  src={freelance.photo_url}
                                  alt={getFullName(freelance)}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <Text
                                  color={colors.white}
                                  fontSize={24}
                                  fontWeight="600"
                                >
                                  {getFullName(freelance)
                                    .charAt(0)
                                    .toUpperCase()}
                                </Text>
                              )}
                            </YStack>
                          </YStack>

                          <YStack flex={1} gap="$1">
                            <Text
                              fontSize={18}
                              fontWeight="700"
                              color={colors.gray900}
                            >
                              {getFullName(freelance)}
                            </Text>
                            <Text fontSize={14} color={colors.gray700}>
                              {freelance.headline ||
                                freelance.bio ||
                                "Freelance"}
                            </Text>
                            {freelance.note && (
                              <XStack alignItems="center" gap="$1">
                                <Text fontSize={14} color={colors.shiftlyGold}>
                                  ⭐
                                </Text>
                                <Text
                                  fontSize={14}
                                  fontWeight="600"
                                  color={colors.gray700}
                                >
                                  {freelance.note.toFixed(1)} (12)
                                </Text>
                              </XStack>
                            )}
                            <Text
                              fontSize={14}
                              color={colors.gray700}
                              fontWeight="500"
                            >
                              25€ / heure
                            </Text>
                          </YStack>
                        </XStack>

                        {/* Tags/Badges */}
                        {getTags(freelance).length > 0 && (
                          <XStack gap="$2" flexWrap="wrap">
                            {getTags(freelance).map((tag, index) => (
                              <XStack
                                key={index}
                                paddingHorizontal="$2"
                                paddingVertical="$1"
                                borderRadius="$2"
                                backgroundColor={colors.gray100}
                                borderWidth={1}
                                borderColor={colors.gray200}
                              >
                                <Text fontSize={12} color={colors.gray700}>
                                  {tag}
                                </Text>
                              </XStack>
                            ))}
                          </XStack>
                        )}

                        {/* Boutons d'action */}
                        <XStack gap="$2" marginTop="$2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onPress={(e) => {
                              e.stopPropagation();
                              handleViewProfile(freelance.id);
                            }}
                            flex={1}
                          >
                            Voir profil
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onPress={(e) => {
                              e.stopPropagation();
                              handleInvite(freelance.id);
                            }}
                            flex={1}
                          >
                            Inviter
                          </Button>
                        </XStack>
                      </YStack>
                    </YStack>
                  ))}
                </XStack>
              )}
            </YStack>
          </XStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
