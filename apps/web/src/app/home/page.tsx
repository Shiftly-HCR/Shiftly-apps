"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import { Badge, Button, MissionCard, colors } from "@hestia/ui";
import { useState, useEffect } from "react";
import { FiMap } from "react-icons/fi";
import { AppLayout } from "../../components/AppLayout";
import { getPublishedMissions, type Mission } from "@hestia/data";

export default function HomePage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState([
    "Serveur",
    "Paris",
    "Disponible demain",
    "Rémunération 18€/heure",
  ]);

  // Charger les missions publiées depuis Supabase
  useEffect(() => {
    const loadMissions = async () => {
      setIsLoading(true);
      const publishedMissions = await getPublishedMissions();
      setMissions(publishedMissions);
      setIsLoading(false);
    };

    loadMissions();
  }, []);

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

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
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
          {/* Filtres actifs */}
          {activeFilters.length > 0 && (
            <XStack
              paddingVertical="$4"
              gap="$3"
              flexWrap="wrap"
              alignItems="center"
            >
              <Text fontSize={14} color={colors.gray700} fontWeight="600">
                Filtres actifs:
              </Text>

              {activeFilters.map((filter) => (
                <XStack
                  key={filter}
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
                    {filter}
                  </Text>
                  <Text
                    fontSize={16}
                    color={colors.gray700}
                    cursor="pointer"
                    hoverStyle={{ color: "#EF4444" }}
                    onPress={() => removeFilter(filter)}
                  >
                    ✕
                  </Text>
                </XStack>
              ))}

              <Text
                fontSize={13}
                color={colors.hestiaOrange}
                fontWeight="600"
                cursor="pointer"
                textDecorationLine="underline"
                hoverStyle={{ opacity: 0.8 }}
                onPress={clearAllFilters}
              >
                Effacer tout
              </Text>

              <XStack
                marginLeft="auto"
                paddingHorizontal="$3"
                paddingVertical="$2"
                backgroundColor={colors.white}
                borderRadius="$3"
                borderWidth={1}
                borderColor={colors.gray200}
                gap="$2"
                alignItems="center"
                cursor="pointer"
                hoverStyle={{
                  borderColor: colors.hestiaOrange,
                  backgroundColor: "#FFF4E6",
                }}
              >
                <FiMap size={16} color={colors.hestiaOrange} />
                <Text fontSize={13} color={colors.gray900} fontWeight="600">
                  Carte
                </Text>
              </XStack>
            </XStack>
          )}

          {/* Grille de missions */}
          <YStack gap="$4" marginTop="$4">
            {missions.length === 0 ? (
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
            ) : (
              <XStack flexWrap="wrap" gap="$4" justifyContent="flex-start">
                {missions.map((mission) => (
                  <YStack
                    key={mission.id}
                    width="calc(33.333% - 12px)"
                    minWidth={300}
                    position="relative"
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
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </AppLayout>
  );
}
